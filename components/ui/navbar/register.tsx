import { useState } from "react";

type Role = "user" | "verifier" | null;

const Step1 = ({ setRole, nextStep }: { setRole: (role: Role) => void; nextStep: () => void }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Choose Your Role</h2>
      <div className="flex justify-around">
        <div
          onClick={() => {
            setRole("user");
            nextStep();
          }}
          className="cursor-pointer border rounded-md p-4 w-1/3 hover:bg-gray-100"
        >
          <h3 className="text-center font-bold">User</h3>
          <p className="text-center text-sm text-gray-500">
            A user can access the platform to interact with the verifier.
          </p>
        </div>
        <div
          onClick={() => {
            setRole("verifier");
            nextStep();
          }}
          className="cursor-pointer border rounded-md p-4 w-1/3 hover:bg-gray-100"
        >
          <h3 className="text-center font-bold">Verifier</h3>
          <p className="text-center text-sm text-gray-500">
            A verifier has the ability to approve or verify user data.
          </p>
        </div>
      </div>
    </div>
  );
};

const Step2 = ({ closeRegisterModal }: { closeRegisterModal: () => void }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Register Your Account</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={closeRegisterModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

const Step3 = () => {
  return (
    <div className="text-center">
      <h2 className="text-lg font-bold mb-4">Registration Complete!</h2>
      <p className="text-gray-600">Thank you for registering. You can now use the platform.</p>
    </div>
  );
};

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<Role>(null);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const previousStep = () => setCurrentStep((prev) => prev - 1);

  return (
    <div className="p-6">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-6">
        <div
          className={`h-2 w-1/3 rounded-full ${
            currentStep >= 1 ? "bg-indigo-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-2 w-1/3 rounded-full ${
            currentStep >= 2 ? "bg-indigo-600" : "bg-gray-300"
          }`}
        ></div>
        <div
          className={`h-2 w-1/3 rounded-full ${
            currentStep >= 3 ? "bg-indigo-600" : "bg-gray-300"
          }`}
        ></div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && <Step1 setRole={setRole} nextStep={nextStep} />}
      {currentStep === 2 && <Step2 closeRegisterModal={previousStep} />}
      {currentStep === 3 && <Step3 />}
    </div>
  );
};

export default RegisterPage;
