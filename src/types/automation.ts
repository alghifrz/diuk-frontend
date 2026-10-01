export type AutomationStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type Automation = {
  id: string;
  name: string;
  description: string | null;
  status: AutomationStatus;
  trigger_type: string;
  action_type: string;
  created_at: string;
  updated_at: string;
};
