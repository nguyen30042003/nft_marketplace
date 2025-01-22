import NftList from "@ui/nft/list";
import apiClient from "components/service/apiClient";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Type definition for the role
type Role = "user" | "verifier" | null;

// Progress Bar Component
const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = ["Choose Role", "Register Work", "Preview"];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                index + 1 <= currentStep
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  index + 1 < currentStep ? "bg-indigo-600" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-4 text-sm text-gray-700 font-medium">
        Step {currentStep}: {steps[currentStep - 1]}
      </div>
    </div>
  );
};

// Step1 Component
const Step1 = ({ setRole, nextStep }: { setRole: (role: Role) => void; nextStep: () => void }) => {
  return (
    <div>
      <h2 className="text-center text-4xl font-bold mb-4">Choose Your Role</h2>
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

// Step2 Component
const Step2 = ({
  closeRegisterModal,
  nextStep,
  data,
  setData,
}: {
  closeRegisterModal: () => void;
  nextStep: () => void;
  data: Record<string, string>;
  setData: (field: string, value: string) => void;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(name, value);

    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateFields = () => {
    const requiredFields = ["username", "email", "role"];

    const newErrors: Record<string, string> = {};
    requiredFields.forEach((field) => {
      if (!data[field] || data[field].trim() === "") {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    setErrors(newErrors);

    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateFields()) {
      nextStep();
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Register Your Information</h2>
      <form>
        {["username", "email"].map((field) => (
          <div className="mb-4" key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              name={field}
              value={data[field] || ""}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
                errors[field] ? "border-red-500" : ""
              }`}
            />
            {errors[field] && (
              <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
          </div>
        ))}

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={data.role || ""}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
              errors.role ? "border-red-500" : ""
            }`}
          >
            <option value="">Select a role</option>
            <option value="USER">USER</option>
            <option value="VERIFIER">VERIFIER</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md"
            onClick={closeRegisterModal}
          >
            Back to Step 1
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-indigo-600 text-white"
            onClick={handleNextStep}
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};





// Step3 Component
const Step3 = ({
  data,
  previousStep,
  account,
}: {
  data: Record<string, string>;
  previousStep: () => void;
  account: string | null;
}) => {
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const apiUrl = "http://localhost:8081/auth/signup";
      const payload = {
        username: data.username,
        address: account,
        email: data.email,
        role: data.role, // Sử dụng role từ Step 2
      };

      await apiClient(apiUrl, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/");
    } catch (error) {
      console.error("Failed to submit data:", error);
      alert("There was an error submitting your data. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-center">Registration Preview</h2>
      <div className="border p-4 rounded-md bg-gray-50">
        {Object.entries(data).map(([key, value]) => (
          <p key={key} className="text-sm text-gray-800 mb-2">
            <strong>{key.replace(/([A-Z])/g, " $1")}: </strong>
            {value}
          </p>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md"
          onClick={previousStep}
        >
          Back to Step 2
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-indigo-600 text-white"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};



// RegisterPage Component
const RegisterPage = ({ account }: { account: string | null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [data, setData] = useState<Record<string, string>>({});

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const previousStep = () => setCurrentStep((prev) => prev - 1);

  const updateData = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <section className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-8">
        <ProgressBar currentStep={currentStep} />
        {currentStep === 1 && <Step1 setRole={setRole} nextStep={nextStep} />}
        {currentStep === 2 && (
          <Step2
            closeRegisterModal={previousStep}
            nextStep={nextStep}
            data={data}
            setData={updateData}
          />
        )}
        {currentStep === 3 && <Step3 data={data} previousStep={previousStep} account={account} />}
      </div>
    </section>
  );
};


const Create: NextPage = () => {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  useEffect(() => {
    if (router.query.account) {
      setAccount(router.query.account as string);
    }
  }, [router.query.account]);

  return (
    <div>
      <RegisterPage account={account} />
    </div>
  );
};

export default Create;
