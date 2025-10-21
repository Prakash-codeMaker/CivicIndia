import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useRouter } from '../routing/RouterContext';

const getAiClient = () => {
    const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || undefined;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') { // Also check for placeholder
        console.error("Gemini API key not configured.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
}

const issueTypes = [
  'Water Issues',
  'Sanitation',
  'Infrastructure',
  'Emergency',
  'Other'
];

interface FormErrors {
  issueType?: string;
  location?: string;
  description?: string;
  photo?: string;
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


const ReportIssue: React.FC = () => {
  const [issueType, setIssueType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSuggestingType, setIsSuggestingType] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [imageVerificationStatus, setImageVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'rejected'>('idle');
  const [imageVerificationFeedback, setImageVerificationFeedback] = useState('');
  const [isConfirming, setIsConfirming] = useState(false); // State for confirmation dialog
  const { navigate } = useRouter();


  const processImagesWithAI = async (imageFiles: File[]) => {
      if (imageFiles.length === 0) return;
      
      const ai = getAiClient();
      if (!ai) {
          console.warn("AI client not available, skipping AI processing.");
          setImageVerificationStatus('idle');
          setImageVerificationFeedback('AI features are not configured.');
          return;
      }

      setIsProcessingAI(true);
      setImageVerificationStatus('verifying');
      setImageVerificationFeedback('');
      setSuggestedTags([]);

      try {
          const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));
          const prompt = `
            Analyze the following image(s) of a potential civic issue.
            1. Verify if the image appears to be a genuine photograph of a real-world scene and depicts a legitimate civic issue (e.g., pothole, garbage, broken infrastructure, etc.). It should not be a meme, cartoon, screenshot of a game, or irrelevant photo.
            2. Identify the main subjects and provide 3-5 relevant one-word or two-word tags.

            Respond with a single JSON object in the following format, and nothing else:
            {
              "is_verified": boolean,
              "reason": "A brief explanation for your verification decision.",
              "tags": ["tag1", "tag2", "tag3"]
            }
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [...imageParts, { text: prompt }] },
          });
          
          let aiResponse;
          try {
              const jsonString = response.text.replace(/```json\n|```/g, '').trim();
              aiResponse = JSON.parse(jsonString);
          } catch (e) {
              console.error("Failed to parse AI JSON response:", response.text, e);
              throw new Error("AI response was not valid JSON.");
          }

          if (aiResponse.is_verified) {
              setImageVerificationStatus('verified');
              setImageVerificationFeedback(aiResponse.reason || 'Image looks legitimate.');
          } else {
              setImageVerificationStatus('rejected');
              setImageVerificationFeedback(aiResponse.reason || 'Image does not seem to be a valid civic issue.');
          }

          const tags = aiResponse.tags || [];
          setSuggestedTags(prev => [...new Set([...prev, ...tags])]);

      } catch (error) {
          console.error("Error processing images with AI:", error);
          setImageVerificationStatus('rejected');
          setImageVerificationFeedback('Could not verify the image. Please try another one.');
      } finally {
          setIsProcessingAI(false);
      }
  };


  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newPhotos = [...photos, ...files];
      setPhotos(newPhotos);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
      
      processImagesWithAI(files);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
    setPhotoPreviews(prev => {
        const newPreviews = prev.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(prev[indexToRemove]);
        return newPreviews;
    });
    if (photos.length === 1) { // Reset verification if all photos are removed
      setImageVerificationStatus('idle');
      setImageVerificationFeedback('');
      setSuggestedTags([]);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
        const newSet = new Set(prev);
        if (newSet.has(tag)) {
            newSet.delete(tag);
        } else {
            newSet.add(tag);
        }
        return newSet;
    });
  };
  
  const validate = (): FormErrors => {
      const newErrors: FormErrors = {};
      if (!issueType) newErrors.issueType = 'Please select an issue type.';
      if (!location.trim()) newErrors.location = 'Location is required.';
      if (!description.trim()) newErrors.description = 'Please provide a description.';
      if (photos.length === 0) newErrors.photo = 'At least one photo is required for verification.';
      return newErrors;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(`Approx. location near Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
                setErrors(prev => ({...prev, location: undefined}));
                setIsFetchingLocation(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                alert("Could not retrieve your location. Please enable location services or enter the address manually.");
                setIsFetchingLocation(false);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  const suggestIssueType = async () => {
    if (!description && photos.length === 0) return;

    const ai = getAiClient();
    if (!ai) {
        console.warn("AI client not available, skipping AI type suggestion.");
        setErrors(prev => ({ ...prev, issueType: 'Please select an issue type manually.' }));
        return;
    }

    setIsSuggestingType(true);
    setErrors(prev => {
        const { issueType, ...rest } = prev;
        return rest;
    });

    try {
        const imageParts = await Promise.all(photos.map(fileToGenerativePart));
        const promptParts = [
            { text: `Based on the following description and/or images, suggest the best issue category. The available categories are: ${issueTypes.join(', ')}. Please return only the single most relevant category name from this list, with no other text or punctuation.\n\nDescription: "${description}"` },
            ...imageParts,
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts }
        });

        const suggestedType = response.text.trim();

        if (issueTypes.includes(suggestedType)) {
            setIssueType(suggestedType);
        } else {
            console.warn("AI suggested an invalid issue type:", suggestedType);
            setErrors(prev => ({ ...prev, issueType: 'AI suggestion failed. Please select one.' }));
        }
    } catch (error) {
        console.error("Error suggesting issue type:", error);
        setErrors(prev => ({ ...prev, issueType: 'AI suggestion failed. Please select one.' }));
    } finally {
        setIsSuggestingType(false);
    }
  };
  
  const handleConfirmSubmit = () => {
    setIsConfirming(false);
    setIsSubmitting(true);
    const newComplaintId = `CMPT-${Date.now().toString().slice(-6)}`;
    console.log('Submitting:', { issueType, location, description, photos, tags: Array.from(selectedTags), id: newComplaintId });
    // Simulate API call
    setTimeout(() => {
        sessionStorage.setItem('newComplaintStatus', 'success');
        sessionStorage.setItem('newComplaintId', newComplaintId);
        setIsSubmitting(false);
        navigate('/track'); // Navigate to track page
    }, 1500);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (imageVerificationStatus === 'rejected') {
        setErrors(prev => ({...prev, photo: 'Please upload a valid photo of the issue. The current one was rejected.'}));
        return;
    }

    const validationErrors = validate();

    if (validationErrors.issueType && Object.keys(validationErrors).length === 1 && (description.trim() || photos.length > 0)) {
        suggestIssueType();
        return; 
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsConfirming(true);
    }
  };

  const ConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-primary-dark/80 border border-white/10 rounded-lg p-8 shadow-2xl w-full max-w-lg relative">
        <h2 className="text-2xl font-bold text-white mb-6">Confirm Your Report</h2>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="font-semibold text-gray-400">Issue Type:</span>
            <span className="text-white">{issueType}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="font-semibold text-gray-400">Location:</span>
            <span className="text-white text-right">{location}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-400">Description:</span>
            <p className="text-white mt-1 bg-dark-navy/50 p-2 rounded-md max-h-24 overflow-y-auto">{description}</p>
          </div>
          {photoPreviews.length > 0 && (
            <div>
              <span className="font-semibold text-gray-400">Photo:</span>
              <img src={photoPreviews[0]} alt="Report preview" className="mt-2 rounded-md max-h-32 w-auto" />
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className="px-6 py-2 rounded-md text-sm font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSubmit}
            className="px-6 py-2 rounded-md text-sm font-semibold text-white bg-glow-blue hover:bg-blue-500 transition-colors"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isConfirming && <ConfirmationDialog />}
      <div className="bg-primary-dark/50 rounded-lg border border-white/10 shadow-2xl p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Issue Type */}
            <div>
              <label htmlFor="issue-type" className="block text-sm font-medium text-gray-300">
                Issue Type
              </label>
              <select
                id="issue-type"
                name="issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base bg-dark-navy border-gray-600 focus:outline-none focus:ring-glow-blue focus:border-glow-blue sm:text-sm rounded-md text-white ${errors.issueType ? 'border-red-500' : ''}`}
              >
                <option value="" disabled>Select an issue</option>
                {issueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.issueType && <p className="mt-2 text-sm text-red-500">{errors.issueType}</p>}
            </div>

            {/* Location */}
            <div>
               <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                Location / Address
              </label>
              <div className="mt-1 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                      </div>
                      <input
                          type="text"
                          name="location"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={`block w-full pl-10 sm:text-sm bg-dark-navy border-gray-600 rounded-md focus:ring-glow-blue focus:border-glow-blue text-white ${errors.location ? 'border-red-500' : ''}`}
                          placeholder="e.g., Near City Park, Main Street"
                      />
                  </div>
                  <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isFetchingLocation}
                      className="flex-shrink-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-dark-navy hover:bg-primary-dark disabled:opacity-50"
                  >
                      {isFetchingLocation ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                      <span className="ml-2">Use My Location</span>
                  </button>
              </div>
              {errors.location && <p className="mt-2 text-sm text-red-500">{errors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`mt-1 block w-full shadow-sm sm:text-sm bg-dark-navy border-gray-600 rounded-md focus:ring-glow-blue focus:border-glow-blue text-white ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the issue in detail..."
              ></textarea>
              {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Photo Upload */}
            <div>
               <label className="block text-sm font-medium text-gray-300">
                Upload Photos
              </label>
              {photoPreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-4">
                      {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                              <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover rounded-md"/>
                               <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Remove photo"
                              >
                                 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          </div>
                      ))}
                  </div>
              )}
              <div className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.photo ? 'border-red-500' : 'border-gray-600'} border-dashed rounded-md`}>
                <div className="space-y-1 text-center">
                   <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L36 16m0 0v12a4 4 0 01-4 4H16a4 4 0 01-4-4V12a4 4 0 014-4h12z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-navy rounded-md font-medium text-glow-blue hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-dark-navy focus-within:ring-glow-blue">
                      <span className="p-1">Upload files</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*" multiple/>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              {errors.photo && <p className="mt-2 text-sm text-red-600">{errors.photo}</p>}
              
              {/* AI Verification Status */}
              {imageVerificationStatus !== 'idle' && (
                  <div className={`mt-4 p-3 rounded-md text-sm flex items-start gap-3 ${
                      imageVerificationStatus === 'verifying' ? 'bg-blue-500/10 text-blue-300' :
                      imageVerificationStatus === 'verified' ? 'bg-green-500/10 text-green-300' :
                      imageVerificationStatus === 'rejected' ? 'bg-red-500/10 text-red-300' :
                      'bg-gray-500/10 text-gray-300'
                  }`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {imageVerificationStatus === 'verifying' && (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        )}
                        {imageVerificationStatus === 'verified' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {imageVerificationStatus === 'rejected' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </div>
                      <div>
                          <p className="font-semibold">
                              {imageVerificationStatus === 'verifying' ? 'Verifying Image...' :
                              imageVerificationStatus === 'verified' ? 'Image Verified' :
                              imageVerificationStatus === 'rejected' ? 'Verification Failed' :
                              'AI Verification'}
                          </p>
                          {imageVerificationFeedback && <p className="text-xs">{imageVerificationFeedback}</p>}
                      </div>
                  </div>
              )}
            </div>

             {/* AI Suggested Tags */}
            {(isProcessingAI || suggestedTags.length > 0) && (
              <div>
                <h3 className="text-sm font-medium text-gray-300">AI Suggested Tags</h3>
                {isProcessingAI && imageVerificationStatus !== 'verifying' && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-glow-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Analyzing for tags...
                    </div>
                )}
                 {!isProcessingAI && suggestedTags.length > 0 && (
                     <div className="mt-2 flex flex-wrap gap-2">
                         {suggestedTags.map(tag => (
                             <button
                                 key={tag}
                                 type="button"
                                 onClick={() => toggleTag(tag)}
                                 className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                     selectedTags.has(tag) 
                                     ? 'bg-glow-blue text-white' 
                                     : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                 }`}
                             >
                                # {tag}
                             </button>
                         ))}
                     </div>
                 )}
              </div>
            )}

          </div>

          <div className="mt-8">
              <button
                  type="submit"
                  disabled={isSubmitting || isProcessingAI || isSuggestingType || imageVerificationStatus === 'rejected'}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-glow-blue hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-navy focus:ring-glow-blue disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                  {isSubmitting 
                      ? 'Submitting...' 
                      : isSuggestingType 
                      ? 'Suggesting Category...' 
                      : isProcessingAI
                      ? 'Processing Image...'
                      : 'Submit Report'}
              </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ReportIssue;