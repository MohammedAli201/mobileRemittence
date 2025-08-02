// contexts/TransactionContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Recipient {
  id?: string;
  firstName: string;
  lastName: string,

  phoneNumber: string;
  relationshipToSender:string;
  avatarColor?: string;
}

// interface TransactionData {
//   sendAmount: number;
//   id?:string
//   sendCurrency: string;
//   sendCountry: string;
//   receiveAmount: number;
//   receiveCurrency: string;
//   ReceiveAmount:number,
//   sendingCurrency:string,
  
//   receivingMethod: string;
//   recipient: Recipient;
//   reason: string;
//   fees: number;
//   receivingCountry:string;
//   service:string;
//   totalAmount: number;
//   provider:string;
//   useBonus:boolean;
//   providerName:string;
//   currency: string,
//   exchangeRate:number,
// }

interface TransactionData {
  sendAmount: number;
  useBonus: boolean;
  provider: string;
  sendCurrency: string;
  sendCountry: string;
  receiveAmount: number;
  receiveCurrency: string;
  exchangeRate: number;
  receivingMethod: string;
  receivingCountry: string;
  providerName: string;
  service: string;
  recipient: {
    firstName: string;
    lastName: string;
    relationshipToSender: string;
    phoneNumber: string;
    avatarColor: string;
  };
  reason: string;
  fees: number;
  totalAmount: number;
}

interface TransactionContextType {
  transactionData: TransactionData;
  updateTransaction: (updates: Partial<TransactionData>) => void;
  resetTransaction: () => void;
}

const defaultTransactionData: TransactionData = {
  sendAmount: 0,
  useBonus:false,
  provider:'',
  sendCurrency: 'NOK',
  sendCountry: 'Norway',
  receiveAmount: 0,
  receiveCurrency: '',
  exchangeRate:0.0,

  receivingMethod: '',
  receivingCountry:'',
  providerName:'Frankfurter',

  service:'',
  recipient: {
    firstName: '',
    lastName:'',
    relationshipToSender:'',

    
    phoneNumber: '',
    avatarColor: '#CCCCCC'
  },
  reason: '',
  fees: 0,
  totalAmount: 0
};

const TransactionContext = createContext<TransactionContextType>({
  transactionData: defaultTransactionData,
  updateTransaction: () => {},
  resetTransaction: () => {}
});

export const TransactionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [transactionData, setTransactionData] = useState<TransactionData>(defaultTransactionData);

  const updateTransaction = (updates: Partial<TransactionData>) => {
      console.log('Updating with:', updates); // Add this line

    setTransactionData(prev => ({
      ...prev,
      ...updates,
      recipient: {
        ...prev.recipient,
        ...(updates.recipient || {})
      }
    }));
  };

  const resetTransaction = () => {
    setTransactionData(defaultTransactionData);
  };

  return (
    <TransactionContext.Provider value={{ transactionData, updateTransaction, resetTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};