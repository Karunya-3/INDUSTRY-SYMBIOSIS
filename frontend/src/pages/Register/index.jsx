import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { registerSchema } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Step1Account from './Step1Account';
import Step2Company from './Step2Company';
import Step3Location from './Step3Location';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'factory',
    companyName: '',
    industry: '',
    location: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: formData,
  });
  
  const nextStep = async () => {
    let fieldsToValidate = [];
    
    if (step === 1) {
      fieldsToValidate = ['email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['userType', 'companyName', 'industry'];
    } else if (step === 3) {
      fieldsToValidate = ['location'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      const values = getValues();
      setFormData(values);
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    const values = getValues();
    setFormData(values);
    setStep(step - 1);
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Account
            register={register}
            errors={errors}
            formData={formData}
          />
        );
      case 2:
        return (
          <Step2Company
            register={register}
            errors={errors}
            formData={formData}
            setValue={setValue}
          />
        );
      case 3:
        return (
          <Step3Location
            register={register}
            errors={errors}
            formData={formData}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join the circular economy revolution
            </p>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex-1 h-2 rounded-full mx-1 ${
                    stepNumber <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Step {step} of 3
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStep()}
            
            <div className="mt-6 flex space-x-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  Register
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;