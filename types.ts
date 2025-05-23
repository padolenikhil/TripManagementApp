
export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  paidById: string; // Participant ID
  date: string; // ISO string
}

export interface ManualTransaction {
  id: string;
  tripId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  date: string; // ISO string
  description?: string;
}

export interface Trip {
  id: string;
  name: string;
  participants: Participant[];
  expenses: Expense[];
  manualTransactions: ManualTransaction[];
}

export interface Settlement {
  fromParticipantId: string;
  toParticipantId: string;
  fromParticipantName: string;
  toParticipantName: string;
  amount: number;
}

export interface CalculatedExpenseData {
  totalTripCost: number;
  costPerParticipant: number;
  participantBalances: Array<{
    participant: Participant;
    paidThroughExpenses: number; // Total amount paid via actual expenses
    netFromManualTransactions: number; // Positive if received more P2P, negative if paid out more P2P
    // balance: (paidThroughExpenses - costPerParticipant) - netFromManualTransactions
    balance: number; 
  }>;
  settlements: Settlement[];
}