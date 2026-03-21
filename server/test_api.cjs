const axios = require('axios');

const login = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email: 'zonea@civicfix.com', password: 'zone123' });
    const token = res.data.token;
    console.log("LOGGED IN:", !!token);
    
    const stats = await axios.get('http://localhost:5000/api/zone/complaints', { headers: { Authorization: `Bearer ${token}` }});
    const c = stats.data.find(x => x.status === 'APPROVED');
    
    if(c) {
      console.log('FOUND APPROVED:', c._id);
      const putRes = await axios.put(`http://localhost:5000/api/zone/complaints/${c._id}/status`, { newStatus: 'IN_PROGRESS' }, { headers: { Authorization: `Bearer ${token}` }});
      console.log('SUCCESS:', putRes.status);
    } else {
      console.log('NO APPROVED COMPLAINT FOUND');
    }
  } catch(e) {
    console.log('FAILED:', e.response?.data || e.message);
  }
}
login();
