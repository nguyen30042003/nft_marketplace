export type emailRequest = {
    to: to;
    subject: string;
    htmlContent: string;  
  };
  export type to = {
    name: string;
    email: string;
  };
