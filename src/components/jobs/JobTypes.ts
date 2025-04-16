
export interface Job {
  id: string;
  customer: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  createdAt: string;
  dueDate: string;
  assignedTo: string;
  hasNotification: boolean;
  serialNumber: string;
  customerEmail: string;
  phoneNumber: string;
}
