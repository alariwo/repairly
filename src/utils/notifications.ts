
export const sendEmailNotification = (
  customerEmail: string, 
  jobId: string, 
  status: string
) => {
  // In a real app, this would integrate with an email API service
  // For demo purposes, we'll just log the email details
  console.log(`Email would be sent to: ${customerEmail}`);
  console.log(`Subject: Update on your repair job ${jobId}`);
  console.log(`Body: Your repair job ${jobId} has been marked as ${status}.`);
  
  // Return a promise to simulate an API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully!');
      resolve();
    }, 1000);
  });
};
