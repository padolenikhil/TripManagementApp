import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trip, Participant, Expense, CalculatedExpenseData, Settlement, ManualTransaction } from './types';
import { loadTripsFromGist, saveTripsToGist } from './services/storageService';
import Modal from './components/Modal';

type Theme = 'light' | 'dark' | 'system';
const THEME_STORAGE_KEY = 'tripExpenseApp_theme';

// --- Icon Components (no changes) ---
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21C7.331 21 6.142 20.639 5.101 19.985a11.97 11.97 0 0 1-.664-.554M3.321 16.971A12.025 12.025 0 0 1 8.624 15c1.614 0 3.111.423 4.376 1.168M3.321 16.971l-1.06-.611A11.975 11.975 0 0 1 2.25 15.75c0-1.53.454-2.957 1.232-4.143A12.025 12.025 0 0 1 8.624 9.75c1.614 0 3.111.423 4.376 1.168M3.321 16.971A9.362 9.362 0 0 1 3 15.75c0-1.31.254-2.546.708-3.658M4.803 12.3A11.995 11.995 0 0 1 8.624 9.75c1.032 0 2.008.214 2.892.589m2.796 2.722A11.975 11.975 0 0 1 14.978 15M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 1 2.25 2.25A2.25 2.25 0 0 1 12 16.5a2.25 2.25 0 0 1-2.25-2.25A2.25 2.25 0 0 1 12 12Z" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const DesktopComputerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h9.75a2.25 2.25 0 0 1 2.25 2.25Z" />
  </svg>
);

const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-3.182L12 12.5l-3.182-3.182m0 0a8.25 8.25 0 0 0-11.664 0L3 16.466m13.5-13.5L12 5.5 8.5 2m0 0L4.5 6l3.5 3.5M21 18.5l-3.5-3.5-3.5 3.5m0 0a8.25 8.25 0 0 0-11.664 0l-3.5-3.5M12 12l3.5 3.5 3.5-3.5m0 0L16.5 6l3.5 3.5" />
</svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ArrowDownTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ArrowUpTrayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);


const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  }
  return 'system'; 
};


const App: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');

  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [participantNameInputForModal, setParticipantNameInputForModal] = useState('');
  const [stagedParticipants, setStagedParticipants] = useState<Array<{ id: string, name: string }>>([]);

  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [newExpenseDescription, setNewExpenseDescription] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number | ''>('');
  const [newExpensePaidById, setNewExpensePaidById] = useState<string>('');

  const [isLogPaymentModalOpen, setIsLogPaymentModalOpen] = useState(false);
  const [selectedSettlementForLogging, setSelectedSettlementForLogging] = useState<Settlement | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number | ''>('');

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // GitHub Gist State
  const [githubToken, setGithubToken] = useState<string>(localStorage.getItem('app_github_pat') || '');
  const [dataGistId, setDataGistId] = useState<string>(localStorage.getItem('app_data_gist_id') || '');
  const [gistStatus, setGistStatus] = useState<{ type: 'loading' | 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });


  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: Theme) => {
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else if (currentTheme === 'light') {
        root.classList.remove('dark');
      } else { 
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  // Store GitHub token and Gist ID in localStorage for convenience (not for trips data)
  useEffect(() => {
    localStorage.setItem('app_github_pat', githubToken);
  }, [githubToken]);

  useEffect(() => {
    localStorage.setItem('app_data_gist_id', dataGistId);
  }, [dataGistId]);

  const handleLoadFromGist = async () => {
    if (!dataGistId) {
      setGistStatus({ type: 'error', message: 'Please enter a Gist ID to load data.' });
      return;
    }
    setGistStatus({ type: 'loading', message: 'Loading trips from Gist...' });
    try {
      const loadedTrips = await loadTripsFromGist(dataGistId);
      setTrips(loadedTrips);
      setGistStatus({ type: 'success', message: `Successfully loaded ${loadedTrips.length} trip(s) from Gist ${dataGistId}.` });
      setSelectedTripId(null); // Reset selected trip
    } catch (error: any) {
      console.error("Gist load error:", error);
      setGistStatus({ type: 'error', message: `Failed to load from Gist: ${error.message}` });
    }
  };

  const handleSaveToGist = async () => {
    if (!githubToken) {
      setGistStatus({ type: 'error', message: 'GitHub Personal Access Token is required to save data.' });
      alert("GitHub Personal Access Token is required. Please ensure it has 'gist' scope.");
      return;
    }
    setGistStatus({ type: 'loading', message: 'Saving trips to Gist...' });
    try {
      const result = await saveTripsToGist(trips, githubToken, dataGistId || undefined);
      setDataGistId(result.id); // Update Gist ID if it was newly created or to confirm update
      setGistStatus({ type: 'success', message: `Successfully saved trips. Gist ID: ${result.id}. URL: ${result.html_url}` });
      alert(`Data saved to Gist!\nID: ${result.id}\nURL: ${result.html_url}\n\nPlease save this Gist ID if it's new or you want to use it later.`);
    } catch (error: any) {
      console.error("Gist save error:", error);
      setGistStatus({ type: 'error', message: `Failed to save to Gist: ${error.message}` });
    }
  };

  const handleAddTrip = useCallback(() => {
    if (newTripName.trim() === '') return;
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      name: newTripName.trim(),
      participants: [],
      expenses: [],
      manualTransactions: [],
    };
    setTrips(prevTrips => [...prevTrips, newTrip]);
    setNewTripName('');
    setIsAddTripModalOpen(false);
    setSelectedTripId(newTrip.id);
    setGistStatus({ type: 'idle', message: 'Trip added locally. Remember to save to Gist.' });
  }, [newTripName]);

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
  };

  const handleDeleteTrip = (tripIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this trip and all its data? This action is local until saved to Gist.")) {
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripIdToDelete));
      if (selectedTripId === tripIdToDelete) {
        setSelectedTripId(null);
      }
      setGistStatus({ type: 'idle', message: 'Trip deleted locally. Remember to save changes to Gist.' });
    }
  };
  
  const selectedTrip = useMemo(() => trips.find(trip => trip.id === selectedTripId), [trips, selectedTripId]);

  const handleAddStagedParticipant = () => {
    const name = participantNameInputForModal.trim();
    if (name && !stagedParticipants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        if (selectedTrip && selectedTrip.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert(`Participant "${name}" already exists in this trip.`);
            return;
        }
      setStagedParticipants(prev => [...prev, { id: crypto.randomUUID(), name }]);
      setParticipantNameInputForModal('');
    } else if (name) {
      alert(`Participant "${name}" is already in the staging list or input is invalid.`);
    }
  };

  const handleRemoveStagedParticipant = (tempId: string) => {
    setStagedParticipants(prev => prev.filter(p => p.id !== tempId));
  };
  
  const handleAddParticipants = useCallback(() => {
    if (!selectedTrip || stagedParticipants.length === 0) return;

    const newParticipants: Participant[] = stagedParticipants.map(sp => ({
      id: crypto.randomUUID(), 
      name: sp.name,
    }));

    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.id === selectedTrip.id 
          ? { ...trip, participants: [...trip.participants, ...newParticipants] }
          : trip
      )
    );
    setStagedParticipants([]);
    setParticipantNameInputForModal('');
    setIsAddParticipantModalOpen(false);
    setGistStatus({ type: 'idle', message: 'Participants added locally. Remember to save to Gist.' });
  }, [selectedTrip, stagedParticipants]);

  const isParticipantDeletable = useCallback((participantId: string, trip: Trip | undefined): boolean => {
    if (!trip) return false;
    const hasExpenses = trip.expenses.some(e => e.paidById === participantId);
    const hasManualTransactions = trip.manualTransactions.some(
      mt => mt.fromParticipantId === participantId || mt.toParticipantId === participantId
    );
    return !hasExpenses && !hasManualTransactions;
  }, []);


  const handleDeleteParticipant = (participantIdToDelete: string) => {
    if (!selectedTrip) return;

    const participant = selectedTrip.participants.find(p => p.id === participantIdToDelete);
    if (!participant) return;

    if (!isParticipantDeletable(participantIdToDelete, selectedTrip)) {
      alert(
        `Cannot remove participant "${participant.name}". They are involved in expenses or logged payments. Please clear these records first if you wish to remove them.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to remove participant "${participant.name}"? This action is local until saved to Gist.`)) {
      setTrips(prevTrips =>
        prevTrips.map(trip =>
          trip.id === selectedTrip.id
            ? {
                ...trip,
                participants: trip.participants.filter(p => p.id !== participantIdToDelete),
              }
            : trip
        )
      );
      setGistStatus({ type: 'idle', message: 'Participant removed locally. Remember to save changes to Gist.' });
    }
  };

  const handleAddExpense = useCallback(() => {
    if (!selectedTrip || newExpenseDescription.trim() === '' || newExpenseAmount === '' || Number(newExpenseAmount) <= 0 || newExpensePaidById === '') return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      tripId: selectedTrip.id,
      description: newExpenseDescription.trim(),
      amount: Number(newExpenseAmount),
      paidById: newExpensePaidById,
      date: new Date().toISOString(),
    };
    setTrips(prevTrips =>
      prevTrips.map(trip =>
        trip.id === selectedTrip.id
          ? { ...trip, expenses: [...trip.expenses, newExpense] }
          : trip
      )
    );
    setNewExpenseDescription('');
    setNewExpenseAmount('');
    setNewExpensePaidById('');
    setIsAddExpenseModalOpen(false);
    setGistStatus({ type: 'idle', message: 'Expense added locally. Remember to save to Gist.' });
  }, [selectedTrip, newExpenseDescription, newExpenseAmount, newExpensePaidById]);

  const handleDeleteExpense = (expenseIdToDelete: string) => {
    if (!selectedTrip) return;
    if (window.confirm("Are you sure you want to delete this expense? This will affect balances. Action is local until saved to Gist.")) {
        setTrips(prevTrips =>
        prevTrips.map(trip =>
            trip.id === selectedTrip.id
            ? { ...trip, expenses: trip.expenses.filter(e => e.id !== expenseIdToDelete) }
            : trip
        )
        );
        setGistStatus({ type: 'idle', message: 'Expense deleted locally. Remember to save changes to Gist.' });
    }
  };
  
  const handleOpenLogPaymentModal = (settlement: Settlement) => {
    setSelectedSettlementForLogging(settlement);
    setPaymentAmountInput(settlement.amount);
    setIsLogPaymentModalOpen(true);
  };

  const handleLogSettlementPayment = useCallback(() => {
    if (!selectedTrip || !selectedSettlementForLogging || paymentAmountInput === '' || Number(paymentAmountInput) <= 0) {
        alert("Invalid amount for settlement. Amount must be greater than zero.");
        return;
    }
    const amountToLog = Number(paymentAmountInput);
    if (amountToLog > selectedSettlementForLogging.amount + 0.005) {
        alert(`Cannot log more than the owed amount of ₹${selectedSettlementForLogging.amount.toFixed(2)}.`);
        return;
    }

    const newManualTransaction: ManualTransaction = {
      id: crypto.randomUUID(),
      tripId: selectedTrip.id,
      fromParticipantId: selectedSettlementForLogging.fromParticipantId,
      toParticipantId: selectedSettlementForLogging.toParticipantId,
      amount: amountToLog,
      date: new Date().toISOString(),
      description: `Logged payment: ${selectedSettlementForLogging.fromParticipantName} to ${selectedSettlementForLogging.toParticipantName}`,
    };
    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.id === selectedTrip.id 
          ? { ...trip, manualTransactions: [...trip.manualTransactions, newManualTransaction] }
          : trip
      )
    );
    setIsLogPaymentModalOpen(false);
    setSelectedSettlementForLogging(null);
    setPaymentAmountInput('');
    setGistStatus({ type: 'idle', message: 'Payment logged locally. Remember to save to Gist.' });
  }, [selectedTrip, selectedSettlementForLogging, paymentAmountInput]);


  const handleDeleteManualTransaction = useCallback((transactionId: string) => {
    if (!selectedTrip) return;
    if (window.confirm("Are you sure you want to delete this logged payment? This will affect balances. Action is local until saved to Gist.")) {
        setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === selectedTrip.id 
            ? { ...trip, manualTransactions: trip.manualTransactions.filter(mt => mt.id !== transactionId) }
            : trip
        )
      );
      setGistStatus({ type: 'idle', message: 'Logged payment deleted locally. Remember to save changes to Gist.' });
    }
  }, [selectedTrip]);


  const calculatedData = useMemo((): CalculatedExpenseData | null => {
    if (!selectedTrip || !selectedTrip.participants || selectedTrip.participants.length === 0) return null;

    const totalTripCost = selectedTrip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const costPerParticipant = selectedTrip.participants.length > 0 ? totalTripCost / selectedTrip.participants.length : 0;

    const participantBalances = selectedTrip.participants.map(participant => {
      const paidThroughExpenses = selectedTrip.expenses
        .filter(expense => expense.paidById === participant.id)
        .reduce((sum, expense) => sum + expense.amount, 0);

      let netFromManualTransactions = 0;
      selectedTrip.manualTransactions.forEach(mt => {
        if (mt.toParticipantId === participant.id) {
          netFromManualTransactions += mt.amount;
        }
        if (mt.fromParticipantId === participant.id) {
          netFromManualTransactions -= mt.amount;
        }
      });
      
      const balance = (paidThroughExpenses - costPerParticipant) - netFromManualTransactions;

      return {
        participant,
        paidThroughExpenses,
        netFromManualTransactions,
        balance,
      };
    }).sort((a,b) => a.participant.name.localeCompare(b.participant.name));

    const settlements: Settlement[] = [];
    if (selectedTrip.expenses.length > 0 || selectedTrip.manualTransactions.length > 0) {
        const epsilon = 0.005; 
        let debtors = participantBalances
            .filter(pb => pb.balance < -epsilon)
            .map(pb => ({ ...pb.participant, amountOwed: Math.abs(pb.balance) }));
        let creditors = participantBalances
            .filter(pb => pb.balance > epsilon)
            .map(pb => ({ ...pb.participant, amountDue: pb.balance }));
        
        debtors.sort((a, b) => b.amountOwed - a.amountOwed);
        creditors.sort((a, b) => b.amountDue - a.amountDue);

        let debtorIndex = 0;
        let creditorIndex = 0;

        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const currentDebtor = debtors[debtorIndex];
            const currentCreditor = creditors[creditorIndex];
            
            if (currentDebtor.id === currentCreditor.id) {
                 if (currentDebtor.amountOwed > currentCreditor.amountDue && creditorIndex < creditors.length -1 ) creditorIndex++;
                 else if (debtorIndex < debtors.length -1 ) debtorIndex++;
                 else break; 
                 continue;
            }

            const amountToSettle = Math.min(currentDebtor.amountOwed, currentCreditor.amountDue);

            if (amountToSettle > epsilon) { 
                settlements.push({
                    fromParticipantId: currentDebtor.id,
                    fromParticipantName: currentDebtor.name,
                    toParticipantId: currentCreditor.id,
                    toParticipantName: currentCreditor.name,
                    amount: amountToSettle,
                });
                currentDebtor.amountOwed -= amountToSettle;
                currentCreditor.amountDue -= amountToSettle;
            }

            if (currentDebtor.amountOwed <= epsilon) debtorIndex++;
            if (currentCreditor.amountDue <= epsilon) creditorIndex++;
            
            if (amountToSettle <= epsilon && (debtorIndex < debtors.length && creditorIndex < creditors.length)) {
                 // Complex advancement logic to prevent infinite loops on tiny amounts
                if (debtors[debtorIndex].amountOwed <= epsilon && creditors[creditorIndex].amountDue > epsilon) debtorIndex++;
                else if (creditors[creditorIndex].amountDue <= epsilon && debtors[debtorIndex].amountOwed > epsilon) creditorIndex++;
                else if (debtors[debtorIndex].amountOwed <= epsilon && creditors[creditorIndex].amountDue <= epsilon) { debtorIndex++; creditorIndex++; }
                else if (debtors[debtorIndex].amountOwed <= creditors[creditorIndex].amountDue) debtorIndex++;
                else creditorIndex++;
            }
        }
    }
    return { totalTripCost, costPerParticipant, participantBalances, settlements };
  }, [selectedTrip]);

  const ThemeSwitcher: React.FC<{className?: string}> = ({className}) => (
    <div className={`flex items-center space-x-1 ${className}`}>
        {[
          { value: 'light', Icon: SunIcon, label: 'Light' },
          { value: 'dark', Icon: MoonIcon, label: 'Dark' },
          { value: 'system', Icon: DesktopComputerIcon, label: 'System' },
        ].map(({ value, Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value as Theme)}
            className={`p-2 rounded-md ${
              theme === value
                ? 'bg-blue-500 text-white dark:bg-blue-600'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            } transition-colors`}
            aria-label={`Set theme to ${label}`}
            title={`Set theme to ${label}`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
  );

  const GistStatusDisplay: React.FC = () => {
    if (gistStatus.type === 'idle' && gistStatus.message === '') return null;
    let bgColor = '';
    if (gistStatus.type === 'loading') bgColor = 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300';
    else if (gistStatus.type === 'success') bgColor = 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300';
    else if (gistStatus.type === 'error') bgColor = 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300';
    else bgColor = 'bg-slate-100 dark:bg-slate-700 border-slate-500 text-slate-700 dark:text-slate-300';
    
    return (
      <div className={`p-3 my-4 border-l-4 rounded ${bgColor}`} role="alert">
        <p className="font-medium">
          {gistStatus.type === 'loading' && 'Loading...'}
          {gistStatus.type === 'success' && 'Success!'}
          {gistStatus.type === 'error' && 'Error!'}
          {gistStatus.type === 'idle' && 'Info:'}
        </p>
        <p className="text-sm">{gistStatus.message}</p>
      </div>
    );
  };

  const GitHubConfigSection: React.FC = () => (
    <section aria-labelledby="github-config-heading" className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 id="github-config-heading" className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">GitHub Gist Configuration</h2>
        <div className="space-y-4">
            <div>
                <label htmlFor="githubToken" className="block text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Personal Access Token (PAT)</label>
                <input
                    id="githubToken"
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="Enter your PAT with 'gist' scope"
                    className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Required for saving data. Ensure token has <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">gist</code> scope.
                    This token is stored in your browser's local storage for convenience.
                    <strong className="block text-red-500 dark:text-red-400">Warning: Handle PATs with care. Do not share them.</strong>
                </p>
            </div>
            <div>
                <label htmlFor="dataGistId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gist ID for Trip Data</label>
                <input
                    id="dataGistId"
                    type="text"
                    value={dataGistId}
                    onChange={(e) => setDataGistId(e.target.value)}
                    placeholder="Enter Gist ID to load/update, or leave blank to create new on save"
                    className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This Gist ID is also stored locally for your convenience.
                </p>
            </div>
            <div className="flex space-x-3">
                <button
                    onClick={handleLoadFromGist}
                    disabled={!dataGistId || gistStatus.type === 'loading'}
                    className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Load from Gist
                </button>
                <button
                    onClick={handleSaveToGist}
                    disabled={!githubToken || gistStatus.type === 'loading'}
                    className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <ArrowUpTrayIcon className="h-5 w-5 mr-2" /> Save to Gist
                </button>
            </div>
        </div>
        <GistStatusDisplay />
    </section>
  );


  if (!selectedTripId || !selectedTrip) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 md:p-8 transition-colors duration-300">
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-100">Trip Expense Splitter</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your group travel expenses with ease. Now with GitHub Gist storage!</p>
          <ThemeSwitcher className="absolute top-0 right-0" />
        </header>
        
        <div className="max-w-2xl mx-auto">
          <GitHubConfigSection />
          <button
            onClick={() => setIsAddTripModalOpen(true)}
            className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out mb-6"
            aria-label="Create new trip"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Create New Trip (Locally)
          </button>
          {trips.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg">No trips loaded or created yet. Use GitHub config to load or create a new trip.</p>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Your Trips (Locally Loaded/Created)</h2>
              {trips.slice().sort((a,b) => a.name.localeCompare(b.name)).map(trip => (
                <div key={trip.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-slate-700/50 transition-shadow duration-150">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{trip.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{(trip.participants || []).length} participants, {(trip.expenses || []).length} expenses, {(trip.manualTransactions || []).length} logged payments</p>
                    </div>
                    <div className="flex items-center space-x-2">
                       <button
                        onClick={() => handleSelectTrip(trip.id)}
                        className="bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150"
                      >
                        Open
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition duration-150"
                        title="Delete Trip (locally)"
                        aria-label={`Delete trip ${trip.name} locally`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Modal isOpen={isAddTripModalOpen} onClose={() => setIsAddTripModalOpen(false)} title="Create New Trip">
          <form onSubmit={(e) => {e.preventDefault(); handleAddTrip();}}>
            <div className="space-y-4">
              <label htmlFor="tripName" className="sr-only">Trip Name</label>
              <input
                id="tripName"
                type="text"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="E.g., Goa Adventure, Weekend Getaway"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-150"
              >
                Create Trip (Locally)
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // Selected Trip View (structure remains largely the same, actions are local until saved)
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 md:p-8 transition-colors duration-300">
      <header className="mb-6 relative">
        <button onClick={() => setSelectedTripId(null)} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-flex items-center group" aria-label="Back to trips list">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Trips List
        </button>
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-100">{selectedTrip.name}</h1>
            <ThemeSwitcher />
        </div>
        <GistStatusDisplay /> {/* Show Gist status in trip view too */}
         <div className="mt-4 flex space-x-3 justify-end">
            <button
                onClick={handleLoadFromGist}
                disabled={!dataGistId || gistStatus.type === 'loading'}
                className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" /> Reload from Gist
            </button>
            <button
                onClick={handleSaveToGist}
                disabled={!githubToken || gistStatus.type === 'loading'}
                className="flex items-center justify-center bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowUpTrayIcon className="h-4 w-4 mr-1.5" /> Save Changes to Gist
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Participants Section */}
          <section aria-labelledby="participants-heading" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 id="participants-heading" className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                <UsersIcon className="h-6 w-6 mr-2 text-blue-500 dark:text-blue-400" /> Participants ({selectedTrip.participants.length})
              </h2>
              <button
                onClick={() => {
                  setStagedParticipants([]);
                  setParticipantNameInputForModal('');
                  setIsAddParticipantModalOpen(true);
                }}
                className="bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md text-sm flex items-center transition duration-150"
                aria-label="Add new participants"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add
              </button>
            </div>
            {selectedTrip.participants.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No participants added yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedTrip.participants.slice().sort((a,b) => a.name.localeCompare(b.name)).map(p => {
                  const deletable = isParticipantDeletable(p.id, selectedTrip);
                  return (
                    <li key={p.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-slate-700 dark:text-slate-200">{p.name}</span>
                      <button 
                        onClick={() => handleDeleteParticipant(p.id)}
                        disabled={!deletable}
                        className={`p-1 rounded-full transition-colors ${
                          deletable 
                            ? 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
                            : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                        title={deletable ? `Remove ${p.name}` : `Cannot remove ${p.name}: involved in expenses or logged payments.`}
                        aria-label={deletable ? `Remove participant ${p.name}` : `Cannot remove participant ${p.name} as they are involved in financial records`}
                        aria-disabled={!deletable}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
          
          {/* Expenses Section */}
          <section aria-labelledby="expenses-heading" className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 id="expenses-heading" className="text-xl font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-2 text-green-500 dark:text-green-400" /> Expenses ({selectedTrip.expenses.length})
              </h2>
              {selectedTrip.participants.length > 0 && (
                 <button
                    onClick={() => {
                      if (selectedTrip.participants.length > 0) {
                        setNewExpensePaidById(selectedTrip.participants.length > 0 ? selectedTrip.participants.sort((a,b) => a.name.localeCompare(b.name))[0].id : '');
                      }
                      setIsAddExpenseModalOpen(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md text-sm flex items-center transition duration-150"
                    aria-label="Add new expense"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Add
                  </button>
              )}
            </div>
            {selectedTrip.participants.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">Add participants before adding expenses.</p>
            ) : selectedTrip.expenses.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No expenses recorded yet.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {selectedTrip.expenses.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => {
                  const payer = selectedTrip.participants.find(p => p.id === exp.paidById);
                  return (
                    <div key={exp.id} className="p-3 bg-slate-50 dark:bg-slate-700/60 rounded-md border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{exp.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Paid by: <span className="font-medium text-slate-600 dark:text-slate-300">{payer ? payer.name : 'Unknown'}</span> on {new Date(exp.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                           <p className="font-semibold text-green-600 dark:text-green-400 text-lg">₹{exp.amount.toFixed(2)}</p>
                           <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 mt-1 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title={`Delete expense: ${exp.description}`}
                            aria-label={`Delete expense: ${exp.description}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside aria-labelledby="summary-heading" className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <h2 id="summary-heading" className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Trip Summary</h2>
            {!calculatedData ? (
              <p className="text-slate-500 dark:text-slate-400">Add participants and expenses to see the summary.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Trip Cost (Expenses)</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-100">₹{calculatedData.totalTripCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Cost Per Participant</p>
                  <p className="text-xl font-semibold text-slate-700 dark:text-slate-100">₹{calculatedData.costPerParticipant.toFixed(2)}</p>
                </div>
                <div className="pt-2">
                  <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-3">Participant Balances:</h3>
                  {calculatedData.participantBalances.length === 0 && selectedTrip.participants.length > 0 && (
                     <p className="text-sm text-slate-500 dark:text-slate-400">No expenses yet to calculate balances.</p>
                  )}
                  <ul className="space-y-3">
                    {calculatedData.participantBalances.map(item => (
                      <li key={item.participant.id} className="p-3 bg-slate-50 dark:bg-slate-700/60 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="font-medium text-slate-800 dark:text-slate-100">{item.participant.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          (Paid expenses: ₹{item.paidThroughExpenses.toFixed(2)}, Net P2P: ₹{item.netFromManualTransactions.toFixed(2)})
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          <span className={`block ${Math.abs(item.balance) < 0.01 ? 'text-slate-500 dark:text-slate-400' : item.balance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            Net Status: <span className="font-semibold">
                              {Math.abs(item.balance) < 0.01 ? 'Settled' : item.balance > 0 ? `Gets Back ₹${item.balance.toFixed(2)}` : `Needs to Pay ₹${Math.abs(item.balance).toFixed(2)}`}
                            </span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                  <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-3">Suggested Settlements:</h3>
                  {calculatedData.settlements && calculatedData.settlements.length > 0 ? (
                    <ul className="space-y-2">
                      {calculatedData.settlements.map((settlement, index) => (
                        <li key={`${settlement.fromParticipantId}-${settlement.toParticipantId}-${index}`} className="text-sm text-slate-700 dark:text-slate-200 p-2.5 bg-slate-50 dark:bg-slate-700/60 rounded-md flex justify-between items-center">
                          <div>
                            <span className="font-medium text-red-500 dark:text-red-400">{settlement.fromParticipantName}</span> needs to give <span className="font-semibold">₹{settlement.amount.toFixed(2)}</span> to <span className="font-medium text-green-500 dark:text-green-400">{settlement.toParticipantName}</span>
                          </div>
                          <button
                            onClick={() => handleOpenLogPaymentModal(settlement)}
                            className="ml-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-medium py-1 px-2 rounded-md transition duration-150 flex items-center"
                            title={`Log payment: ${settlement.fromParticipantName} to ${settlement.toParticipantName}`}
                            aria-label={`Log payment from ${settlement.fromParticipantName} to ${settlement.toParticipantName} for amount ${settlement.amount.toFixed(2)}`}
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1"/> Log Payment
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedTrip.expenses.length > 0 || selectedTrip.manualTransactions.length > 0 ? "All debts are settled!" : "No expenses or payments recorded to settle."}
                    </p>
                  )}
                </div>
                
                {selectedTrip.manualTransactions.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                    <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-3">Logged Payments:</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedTrip.manualTransactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(mt => {
                        const fromP = selectedTrip.participants.find(p => p.id === mt.fromParticipantId);
                        const toP = selectedTrip.participants.find(p => p.id === mt.toParticipantId);
                        return (
                          <li key={mt.id} className="text-xs text-slate-600 dark:text-slate-300 p-2 bg-slate-100 dark:bg-slate-700 rounded-md flex justify-between items-center">
                            <div>
                              <span className="font-medium">{fromP ? fromP.name : 'Unknown'}</span> paid <span className="font-medium">{toP ? toP.name : 'Unknown'}</span>
                              <strong className="block text-slate-700 dark:text-slate-100">₹{mt.amount.toFixed(2)}</strong>
                              <span className="text-slate-400 dark:text-slate-500 text-[0.7rem]">{new Date(mt.date).toLocaleString()}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteManualTransaction(mt.id)}
                              className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete this logged payment"
                              aria-label="Delete logged payment"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
      
      {/* Modals (structure remains the same, actions are local until saved) */}
      <Modal isOpen={isAddParticipantModalOpen} onClose={() => {setIsAddParticipantModalOpen(false); setStagedParticipants([]); setParticipantNameInputForModal('');}} title="Add Participants">
        <form onSubmit={(e) => {e.preventDefault(); handleAddParticipants();}}>
          <div className="space-y-4">
            <div>
                <label htmlFor="participantNameInput" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Participant Name</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                    id="participantNameInput"
                    type="text"
                    value={participantNameInputForModal}
                    onChange={(e) => setParticipantNameInputForModal(e.target.value)}
                    placeholder="E.g., Vishal"
                    className="flex-1 p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button
                    type="button"
                    onClick={handleAddStagedParticipant}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-blue-500 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 text-sm font-medium"
                    >
                    Add to List
                    </button>
                </div>
            </div>

            {stagedParticipants.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To be added:</h4>
                <ul className="space-y-1 max-h-32 overflow-y-auto bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-200 dark:border-slate-600">
                  {stagedParticipants.map(sp => (
                    <li key={sp.id} className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-200 py-1">
                      <span>{sp.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedParticipant(sp.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-800/30"
                        aria-label={`Remove ${sp.name} from list`}
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              type="submit"
              disabled={stagedParticipants.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Add Participants
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAddExpenseModalOpen} onClose={() => setIsAddExpenseModalOpen(false)} title="Add Expense">
       <form onSubmit={(e) => {e.preventDefault(); handleAddExpense();}}>
        <div className="space-y-4">
          <div>
            <label htmlFor="expenseDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input
              id="expenseDescription"
              type="text"
              value={newExpenseDescription}
              onChange={(e) => setNewExpenseDescription(e.target.value)}
              placeholder="E.g., Lunch, Fuel"
              className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expenseAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₹)</label>
            <input
              id="expenseAmount"
              type="number"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expensePaidBy" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paid By</label>
            <select
              id="expensePaidBy"
              value={newExpensePaidById}
              onChange={(e) => setNewExpensePaidById(e.target.value)}
              className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="" disabled className="text-slate-500 dark:text-slate-400">Select who paid</option>
              {selectedTrip?.participants.slice().sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                <option key={p.id} value={p.id} className="text-slate-900 dark:text-white">{p.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-150"
          >
            Add Expense
          </button>
        </div>
        </form>
      </Modal>

      {selectedSettlementForLogging && (
        <Modal 
            isOpen={isLogPaymentModalOpen} 
            onClose={() => {
                setIsLogPaymentModalOpen(false); 
                setSelectedSettlementForLogging(null); 
                setPaymentAmountInput('');
            }} 
            title={`Log Payment`}
            size="sm"
        >
            <form onSubmit={(e) => {e.preventDefault(); handleLogSettlementPayment();}}>
            <div className="space-y-4">
                <p className="text-sm text-center text-slate-600 dark:text-slate-300">
                    Logging payment from <strong className="text-red-500 dark:text-red-400">{selectedSettlementForLogging.fromParticipantName}</strong> to <strong className="text-green-500 dark:text-green-400">{selectedSettlementForLogging.toParticipantName}</strong>.
                </p>
                <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Amount to Log (₹)
                    </label>
                    <input
                    id="paymentAmount"
                    type="number"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder={selectedSettlementForLogging.amount.toFixed(2)}
                    min="0.01"
                    step="0.01"
                    className="mt-1 w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                    required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Suggested amount: ₹{selectedSettlementForLogging.amount.toFixed(2)}
                    </p>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 dark:hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-150"
                >
                    Confirm Logged Payment
                </button>
            </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default App;
