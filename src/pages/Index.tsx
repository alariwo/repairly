
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
<<<<<<< HEAD


import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
=======
>>>>>>> c192108c72dab8c6acb0ae375fe1b0bf6131faf9
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to auth page
    navigate('/auth');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;
