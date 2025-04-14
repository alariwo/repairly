
export const sendEmailNotification = (
  customerEmail: string, 
  jobId: string, 
  status: string
) => {
  // In a real app, this would integrate with an email API service
  // For demo purposes, we'll just log the email details
  console.log(`Email would be sent to: ${customerEmail}`);
  console.log(`Subject: ${status}`);
  console.log(`Related to job: ${jobId}`);
  
  // Return a promise to simulate an API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully!');
      resolve();
    }, 1000);
  });
};

export const sendEmailWithAttachments = (
  customerEmail: string,
  subject: string,
  content: string,
  attachments: Array<{name: string, type: string}>
) => {
  // In a real app, this would integrate with an email API service
  // For demo purposes, we'll just log the email details
  console.log(`Email would be sent to: ${customerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);
  console.log(`Attachments: ${attachments.length}`);
  attachments.forEach(attachment => {
    console.log(`- ${attachment.name} (${attachment.type})`);
  });
  
  // Return a promise to simulate an API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('Email with attachments sent successfully!');
      resolve();
    }, 1000);
  });
};
