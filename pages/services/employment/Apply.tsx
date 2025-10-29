import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyEmployment: React.FC = ()=>{
  const { user } = useUser(); const { navigate } = useRouter(); const [jobType,setJobType]=useState('skilled'); const [isSubmitting,setIsSubmitting]=useState(false);
  const submit=async(e:React.FormEvent)=>{ e.preventDefault(); if(!user){alert('Sign in required');return;} setIsSubmitting(true); try{const item=await addApplication({userId:user.id,service:'employment',data:{jobType}}); sessionStorage.setItem('newApplicationId',item.id); navigate('/services/employment/confirmation'); } finally { setIsSubmitting(false); } };
  return (<div className="py-16"><div className="container"><h1>Employment Application</h1><form onSubmit={submit}><select value={jobType} onChange={e=>setJobType(e.target.value)}><option value="skilled">Skilled</option><option value="unskilled">Unskilled</option></select><button disabled={isSubmitting}>Submit</button></form></div></div>);
};
export default ApplyEmployment;
