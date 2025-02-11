interface MetaData {
  name: string;
  applicationForm: string;
  samples: string;
  createAt: string; // ISO 8601 date-time format
}

interface User {
  username: string;
  address: string;
  email: string;
  role: string; // Example: "USER" | "ADMIN"
  isApprove: boolean;
}

interface CopyRight {
  id: string;
  status: string; // Example: "REGISTERED" | "COMPLETED"
  user: User;
  metaData: MetaData;
}
interface Status {
  // Enum for different states of a copyright registration
  INACTIVE: "INACTIVE";
  FILED: "FILED";
  PUBLISHED: "PUBLISHED";
  REGISTERED: "REGISTERED";
  EXPIRED: "EXPIRED";
}
// Example of the data type
type CopyRights = CopyRight[];


interface CopyRightRequest {
  status: string; // Example: "REGISTERED" | "COMPLETED"
  userAddress: String;
  metaData: MetaData;
}