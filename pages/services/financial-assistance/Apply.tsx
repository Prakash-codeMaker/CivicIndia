import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { addApplication } from '../../../lib/serviceStore';
import { useRouter } from '../../../routing/RouterContext';

const ApplyFinancial: React.FC = ()=>{ const { user } = useUser(); const { navigate } = useRouter(); const [reason,setReason]=useState(''); const [amount,setAmount]=useState(''); const submit=async(e:React.FormEvent)=>{ e.preventDefault(); if(!user){alert('Sign in required');return;} try{ const item=await addApplication({ userId:user.id, service:'financial-assistance', data:{reason,amount} }); sessionStorage.setItem('newApplicationId', item.id); navigate('/services/financial-assistance/confirmation'); } catch(e){ console.error(e); } }; return (<div className="py-16"><div className="container"><h1>Financial Assistance</h1><form onSubmit={submit}><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason"/><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/><button>Submit</button></form></div></div>); };
export default ApplyFinancial;
