import React from "react";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "Ownership Verification",
      description: ["The blockchain application enables verification and recording of ownership of digital content (such as songs, videos, images, or software) on the blockchain. Each time content is registered or transferred, the blockchain creates an immutable record to prove ownership and track transfer history."],
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "Security and Transparency",
      description: ["Blockchain uses robust encryption to secure copyright information while providing high transparency. All stakeholders can easily access details related to ownership and changes without relying on intermediaries."],
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "Rights Management",
      description: ["The application allows content owners to set and manage usage rights, including distribution, modification, and sharing rights. These rights can be recorded directly on the blockchain and automatically enforced through smart contracts."],
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "Automated Transactions and Payments",
      description: ["Blockchain supports automated financial transactions via smart contracts. When digital content is used or distributed, payments can be made directly and automatically to the copyright holder based on predefined conditions."],
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "License and Transfer Management",
      description: ["The blockchain application facilitates the licensing and transfer of usage rights for digital content. Ownership or usage rights can be securely, easily, and transparently transferred, helping to avoid legal disputes."],
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-8 h-8 dark:text-violet-600"
        >
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
      title: "Anti-Piracy and Counterfeiting",
      description: ["With blockchain's immutability, the application prevents duplication or counterfeiting of digital content. All changes related to the content are transparently recorded, protecting copyright from infringement and unauthorized use."],
    },
    // Add more items as needed
  ];

  return (
    <section className="dark:bg-gray-100 dark:text-gray-800 items-center justify-center h-[700px]">
      {/* Header */}
      <div className="container mx-auto my-6 space-y-2 text-center">
        <h2 className="text-5xl font-bold">FEATURES</h2>
        <p className="dark:text-gray-600">The platform provide some features for you</p>
      </div>

      {/* Feature Items */}
      <div className="container mx-auto grid justify-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center p-10 text-center">
            {/* Icon */}
            {feature.icon}

            {/* Title */}
            <h3 className="my-3 text-3xl font-semibold">{feature.title}</h3>

            {/* Description */}
            <div className="space-y-1 leading-tight">
              {feature.description.map((desc, idx) => (
                <p key={idx}>{desc}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
