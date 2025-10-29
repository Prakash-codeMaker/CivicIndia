import React, { useEffect, useState } from 'react';
import { getApplicationById } from '../../../lib/serviceStore';
const Confirmation: React.FC = ()=>{ const [app,setApp]=useState<any|null>(null); useEffect(()=>{ const id=sessionStorage.getItem('newApplicationId'); if(!id) return; getApplicationById(id).then(setApp); try{sessionStorage.removeItem('newApplicationId')}catch(e){} },[]); if(!app) return <div className="py-16"><div className="container">No application.</div></div>; return <div className="py-16"><div className="container"><h1>Submitted</h1><p>ID:{app.id} Status:{app.status}</p></div></div>; };
export default Confirmation;
