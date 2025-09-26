import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import Modal from '../components/Modal';
import { Toaster, toast } from 'react-hot-toast';

const getStatusBadge = (status) => {
  if (!status) return 'bg-gray-100 text-gray-500 border border-gray-300 px-3 py-1 rounded-full font-medium shadow-sm';
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium shadow-sm';
    case 'in_progress':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full font-medium shadow-sm';
    case 'pending':
      return 'bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium shadow-sm';
    case 'cancelled':
      return 'bg-gray-100 text-gray-500 border border-gray-300 px-3 py-1 rounded-full font-medium shadow-sm';
    case 'paid':
      return 'bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-medium shadow-sm';
    case 'unpaid':
      return 'bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-medium shadow-sm';
    default:
      return 'bg-gray-100 text-gray-500 border border-gray-300 px-3 py-1 rounded-full font-medium shadow-sm';
  }
};

const getStatusText = (status) => {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'in_progress': return 'In Progress';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'paid': return 'Paid';
    case 'unpaid': return 'Unpaid';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const Transaction = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('unpaid');
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Add state for transaction details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Add state for Add Payment modal
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [addPaymentAmount, setAddPaymentAmount] = useState('');
  const [addPaymentDiscountType, setAddPaymentDiscountType] = useState('N/A'); // Default to None
  const [addPaymentDiscountValue, setAddPaymentDiscountValue] = useState(0); // Default to 0

  // Add state for confirmation modals
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [showCancelPaymentModal, setShowCancelPaymentModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await apiService.getTransactions();
        if (response.data && response.data.records) {
          setReservations(response.data.records);
          
          // Load discounts from backend
          // Remove: const loadedDiscounts = {};
          // Remove: response.data.records.forEach(transaction => {
          // Remove:   if (transaction.discount_data) {
          // Remove:     loadedDiscounts[transaction.reservation_ref_no] = {
          // Remove:       type: transaction.discount_data.type,
          // Remove:       value: transaction.discount_data.value
          // Remove:     };
          // Remove:   }
          // Remove: });
          // Remove: setDiscounts(loadedDiscounts);
        } else {
          setReservations([]);
        }
      } catch (err) {
        setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Show toast error when error state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Calculate price and balance for each transaction (now from backend)
  const getEquipmentTotal = (transaction) =>
    transaction.sample && transaction.sample.length > 0
      ? transaction.sample.reduce((sum, eq) => sum + Number(eq.price), 0)
      : 0;

  // Update balance calculation:
  const getTransactionBalance = (transaction) => {
    // Use the backend amount field instead of recalculating from equipment
    const total = transaction.amount ? parseFloat(transaction.amount) : 0;
    const totalPaidAndDiscount = transaction.payments
      ? transaction.payments.reduce((sum, p) => sum + parseFloat(p.amount) + (p.discount?.peso || 0), 0)
      : 0;
    return Math.max(0, total - totalPaidAndDiscount);
  };

  // Handle showing transaction details
  const handleShowDetails = (transaction) => {
    console.log('Transaction status:', transaction.status);
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleShowAddPayment = (transaction) => {
    setSelectedTransaction(transaction);
    setAddPaymentAmount('');
    const lastPayment = transaction.payments && transaction.payments.length > 0
      ? transaction.payments[transaction.payments.length - 1]
      : null;
    if (lastPayment && lastPayment.discount) {
      setAddPaymentDiscountType(lastPayment.discount.type || 'N/A');
      setAddPaymentDiscountValue(
        lastPayment.discount.type === 'custom'
          ? lastPayment.discount.value?.toString() || ''
          : lastPayment.discount.value?.toString() || ''
      );
    } else {
      setAddPaymentDiscountType('N/A');
      setAddPaymentDiscountValue('');
    }
    setShowAddPaymentModal(true);
  };

  // Always use the original transaction amount for calculations
  const getAddPaymentTotal = () => {
    if (!selectedTransaction) return 0;
    return selectedTransaction.amount ? parseFloat(selectedTransaction.amount) : 0;
  };
  const getAddPaymentDiscountAmount = () => {
    const total = getAddPaymentTotal();
    let percent = 0;
    if (addPaymentDiscountType === 'custom' && addPaymentDiscountValue) {
      percent = parseFloat(addPaymentDiscountValue) || 0;
    } else if (addPaymentDiscountType !== 'custom' && addPaymentDiscountType !== 'N/A') {
      percent = parseFloat(addPaymentDiscountType) || 0;
    }
    return total * percent / 100;
  };
  const getAddPaymentTotalAfterDiscount = () => {
    return getAddPaymentTotal() - getAddPaymentDiscountAmount();
  };
  const getAddPaymentDiscountedBalance = () => {
    const currentBalance = selectedTransaction && selectedTransaction.balance ? parseFloat(selectedTransaction.balance) : getAddPaymentTotal();
    // Only subtract the discount if it hasn't been applied yet
    return Math.max(0, currentBalance);
  };

  const getAddPaymentNewBalance = () => {
    const discountedBalance = getAddPaymentDiscountedBalance();
    const payment = parseFloat(addPaymentAmount) || 0;
    return Math.max(0, discountedBalance - payment);
  };

  // Group equipment by section/type/range for receipt
  const getGroupedEquipments = () => {
    if (!selectedTransaction || !selectedTransaction.sample) return [];
    const groups = {};
    selectedTransaction.sample.forEach(eq => {
      const key = `${eq.section}|${eq.type}|${eq.range}|${eq.price}`;
      if (!groups[key]) {
        groups[key] = { ...eq, qty: 1, total: Number(eq.price) };
      } else {
        groups[key].qty += 1;
        groups[key].total += Number(eq.price);
      }
    });
    return Object.values(groups);
  };

  const filteredReservations = reservations.filter(transaction => {
    const matchesSearch =
      transaction.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reservation_ref_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      (statusFilter === 'paid' && (transaction.status?.toLowerCase() === 'paid' || transaction.status?.toLowerCase() === 'partially_paid')) ||
      (statusFilter === 'unpaid' && transaction.status?.toLowerCase() === 'unpaid');
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered reservations
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredReservations.length / rowsPerPage);

  // Reset to first page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, reservations.length]);

  const totalPrice = filteredReservations.reduce((sum, transaction) => sum + getEquipmentTotal(transaction), 0);

  React.useEffect(() => {
    const isHundred =
      (addPaymentDiscountType === 'custom' && parseFloat(addPaymentDiscountValue) === 100) ||
      (addPaymentDiscountType !== 'custom' && addPaymentDiscountType !== 'N/A' && parseFloat(addPaymentDiscountType) === 100);
    if (isHundred && addPaymentAmount !== '') {
      setAddPaymentAmount('');
    }
  }, [addPaymentDiscountType, addPaymentDiscountValue]);

  const handleAddPaymentSubmit = async () => {
    if (!selectedTransaction) return;
    const refNo = selectedTransaction.reservation_ref_no;
    const discountPercent = addPaymentDiscountType === 'custom'
      ? parseFloat(addPaymentDiscountValue) || 0
      : addPaymentDiscountType !== 'N/A'
        ? parseFloat(addPaymentDiscountType) || 0
        : 0;
    // When calculating discountPeso, always use the original amount
    const discountPeso = (getAddPaymentTotal() * discountPercent) / 100;
    // Calculate the expected final amount after discount
    const currentBalance = getTransactionBalance(selectedTransaction);
    const expectedAmount = Math.max(0, currentBalance - discountPeso);
    
    // For 100% discount, payment amount should be the full amount, not 0
    const payment_amount = discountPercent === 100 ? getAddPaymentTotal() : getAddPaymentTotalAfterDiscount();
    
    // Validation: Only allow payment if amount matches expected
    if (Math.abs(payment_amount - expectedAmount) > 0.01) {
      toast.error(`Payment amount must be exactly ₱${expectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      return;
    }
    try {
      await apiService.processPayment({
        reservation_ref_no: refNo,
        payment_amount,
        discount: {
          type: addPaymentDiscountType,
          value: discountPercent,
          peso: discountPeso
        }
      });
      toast.success('Payment processed successfully!');
      setShowAddPaymentModal(false);
      // Optionally refresh transactions
      const response = await apiService.getTransactions();
      if (response.data && response.data.records) {
        setReservations(response.data.records);
        // Mark selected transaction as paid if found
        const updated = response.data.records.find(t => t.reservation_ref_no === selectedTransaction.reservation_ref_no);
        if (updated && updated.status && updated.status.toLowerCase() === 'paid') {
          setSelectedTransaction(updated);
          setShowDetailsModal(false); // Close Transaction Details modal only after status is updated
        } else {
          setShowDetailsModal(false); // Fallback: always close modal after payment
        }
      } else {
        setShowDetailsModal(false); // Fallback: always close modal after payment
      }
    } catch (err) {
      toast.error('Failed to process payment.');
    }
  };

  return (
    <div className="p-2 sm:p-6 bg-gray-100 h-full w-full">
      <Toaster />
      <main className="flex-1">
        <div className="bg-white p-2 sm:p-8 rounded-lg shadow-md w-full overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transaction</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 w-full">
            <div className="flex bg-[#e0f7fa] rounded-lg h-10 gap-1 w-full sm:w-fit">
              {[
                { key: 'unpaid', label: 'Unpaid' },
                { key: 'paid', label: 'Paid' }
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setStatusFilter(option.key)}
                  className={`flex-1 px-5 h-10 text-sm rounded-md font-medium transition-colors text-center border-none focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${statusFilter === option.key
                      ? 'bg-[#2a9dab] text-white shadow'
                      : 'bg-transparent text-[#2a9dab] hover:bg-[#b2ebf2]'}
                  `}
                  style={{ minWidth: '110px' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg h-10 min-w-0"
            />
          </div>
          <div className="overflow-x-auto w-full">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : (
              <table className="min-w-full bg-white text-xs sm:text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Reference No.</th>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Balance</th>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReservations.map((transaction) => {
                    const equipmentTotal = getEquipmentTotal(transaction);
                    return (
                      <tr key={transaction.reservation_ref_no} className="align-top">
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap break-all max-w-[120px] sm:max-w-xs text-xs sm:text-sm font-medium text-gray-900">{transaction.reservation_ref_no}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap break-all max-w-[120px] sm:max-w-xs text-xs sm:text-sm text-gray-500">{transaction.client_name}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₱ {equipmentTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">₱ {getTransactionBalance(transaction).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <span className={`capitalize ${getStatusBadge(transaction.status)}`}>{getStatusText(transaction.status)}</span>
                        </td>
                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleShowDetails(transaction)}
                              className="bg-[#2a9dab] text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-[#1f8a96] transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border text-sm font-medium ${currentPage === page ? 'bg-[#2a9dab] text-white' : 'bg-white text-[#2a9dab] border-[#2a9dab] hover:bg-[#b2ebf2]'}`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Transaction Details"
        className="!w-[700px]"
      >
        {selectedTransaction && (
          <div className="space-y-8">
            {/* Header - Cleanest possible */}
            <div className="flex items-center justify-between px-2 pt-2 pb-1">
              <div>
                <div className="text-base font-semibold text-gray-900 leading-tight">{selectedTransaction.client_name}</div>
                <div className="text-xs text-gray-400 font-mono">#{selectedTransaction.reservation_ref_no}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase ${getStatusBadge(selectedTransaction.status)}`}>
                {getStatusText(selectedTransaction.status)}
              </span>
            </div>

            {/* Equipment & Services - grouped by section/type/range */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Equipment & Services</div>
              <table className="w-full mb-2">
                <thead>
                  <tr className="text-gray-400 border-b border-dashed text-xs">
                    <th className="text-left px-2 py-1 font-normal">Scope</th>
                    <th className="text-left px-2 py-1 font-normal">Type</th>
                    <th className="text-center px-2 py-1 font-normal">Qty</th>
                    <th className="text-right px-2 py-1 font-normal">Unit</th>
                    <th className="text-right px-2 py-1 font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(function() {
                    if (!selectedTransaction.sample || selectedTransaction.sample.length === 0) {
                      return (
                        <tr><td colSpan={5} className="text-center text-gray-400 py-2">No samples listed for this transaction.</td></tr>
                      );
                    }
                    // Group equipment by section/type/range/price
                    const groups = {};
                    selectedTransaction.sample.forEach(eq => {
                      const key = `${eq.section}|${eq.type}|${eq.range}|${eq.price}`;
                      if (!groups[key]) {
                        groups[key] = { ...eq, qty: 1, total: Number(eq.price) };
                      } else {
                        groups[key].qty += 1;
                        groups[key].total += Number(eq.price);
                      }
                    });
                    return Object.values(groups).map((eq, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 align-top text-gray-700">{eq.section}</td>
                        <td className="px-2 py-1 align-top text-gray-700">{eq.type} <span className="text-xs text-gray-400">({eq.range})</span></td>
                        <td className="px-2 py-1 text-center align-top text-gray-700">{eq.qty}</td>
                        <td className="px-2 py-1 text-right font-mono align-top whitespace-nowrap text-gray-800">₱{Number(eq.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-2 py-1 text-right font-mono align-top whitespace-nowrap text-gray-800">₱{eq.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              <div className="flex justify-end mt-8 mb-0">
                <span className="font-bold text-gray-800 text-base">
                  Total: ₱ {selectedTransaction.balance !== undefined && selectedTransaction.balance !== null
                    ? Number(selectedTransaction.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '0.00'}
                </span>
              </div>
            </div>

            {/* Discount - minimalist */}
            {/* Remove: discounts[selectedTransaction.reservation_ref_no] && discounts[selectedTransaction.reservation_ref_no].type !== 'N/A' && ( */}
            {/* Remove:   <div> */}
            {/* Remove:     <div className="text-xs text-gray-400 mb-1">Discount</div> */}
            {/* Remove:     <div className="flex items-center justify-between"> */}
            {/* Remove:       <div className="text-sm text-gray-700 font-medium"> */}
            {/* Remove:         {discounts[selectedTransaction.reservation_ref_no].type === 'custom'  */}
            {/* Remove:           ? `${discounts[selectedTransaction.reservation_ref_no].value}% off` */}
            {/* Remove:           : `${discounts[selectedTransaction.reservation_ref_no].type}% off` */}
            {/* Remove:         } */}
            {/* Remove:       </div> */}
            {/* Remove:       <div className="text-base font-semibold text-gray-900"> */}
            {/* Remove:         -₱ {(getEquipmentTotal(selectedTransaction) - applyDiscount(getEquipmentTotal(selectedTransaction), selectedTransaction.reservation_ref_no)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
            {/* Remove:       </div> */}
            {/* Remove:     </div> */}
            {/* Remove:   </div> */}
            {/* Remove: ) */}

            {/* Total Paid and Payment History */}
            {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Total Paid</span>
                  <span className="font-mono font-bold text-green-700 text-base">
                    ₱{selectedTransaction.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-1">Payment History</div>
                <table className="w-full text-xs mb-2">
                  <thead>
                    <tr className="text-gray-400 border-b border-dashed">
                      <th className="text-left px-2 py-1 font-normal">Date</th>
                      <th className="text-right px-2 py-1 font-normal">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.payments.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 align-top text-gray-700">{new Date(p.payment_date).toLocaleString()}</td>
                        <td className="px-2 py-1 align-top text-green-700 text-right font-mono">
                          ₱{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {p.discount && p.discount.peso > 0 && (
                            <span className="text-xs text-gray-500 ml-2">(+₱{p.discount.peso.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} discount)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Button for Unpaid/Partially Paid */}
            {(() => {
              const status = selectedTransaction.status?.toLowerCase();
              const showButton = status === 'unpaid' || status === 'partially_paid';
              console.log('Payment button check:', { status, showButton, selectedTransaction });
              return showButton;
            })() && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleShowAddPayment(selectedTransaction)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Add Payment
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={showAddPaymentModal}
        onClose={() => setShowCancelPaymentModal(true)}
        title={<div className="text-center w-full text-xl font-bold text-gray-800 mb-2">Add Payment</div>}
        className="!w-[700px] !bg-white !rounded-2xl !shadow-2xl !border-0"
      >
        {selectedTransaction && (
          <div className="font-sans">
            {/* Subtle Receipt Heading */}
            <div className="text-center text-gray-400 text-xs mb-1">Receipt</div>
            <table className="w-full mb-2 text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-dashed text-xs">
                  <th className="text-left px-2 py-1 font-normal">Scope</th>
                  <th className="text-left px-2 py-1 font-normal">Type</th>
                  <th className="text-center px-2 py-1 font-normal">Qty</th>
                  <th className="text-right px-2 py-1 font-normal">Unit</th>
                  <th className="text-right px-2 py-1 font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {getGroupedEquipments().length > 0 ? (
                  getGroupedEquipments().map((eq, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 align-top text-gray-700">{eq.section}</td>
                      <td className="px-2 py-1 align-top text-gray-700">{eq.type} <span className="text-xs text-gray-400">({eq.range})</span></td>
                      <td className="px-2 py-1 text-center align-top text-gray-700">{eq.qty}</td>
                      <td className="px-2 py-1 text-right font-mono align-top whitespace-nowrap text-gray-800">₱{Number(eq.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-2 py-1 text-right font-mono align-top whitespace-nowrap text-gray-800">₱{eq.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-2">No services</td></tr>
                )}
              </tbody>
            </table>
            {/* Polished summary area */}
            <div className="mt-4 space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-mono text-gray-800">₱{getAddPaymentTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Discount</span>
                <span className="flex items-center gap-2">
                  <select
                    value={addPaymentDiscountType}
                    onChange={e => setAddPaymentDiscountType(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9dab]"
                    style={{ minWidth: '70px' }}
                  >
                    <option value="N/A">None</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="custom">Custom</option>
                  </select>
                  {addPaymentDiscountType === 'custom' && (
                    <input
                      type="number"
                      value={addPaymentDiscountValue}
                      onChange={e => {
                        let val = e.target.value.replace(/[^\d.]/g, ""); // Remove non-numeric
                        if (val === "") {
                          setAddPaymentDiscountValue("");
                        } else {
                          val = Math.max(0, Math.min(100, Number(val)));
                          setAddPaymentDiscountValue(val);
                        }
                      }}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9dab]"
                      placeholder="%"
                      min="0"
                      max="100"
                    />
                  )}
                  <span className="text-red-600 font-mono">-₱{getAddPaymentDiscountAmount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
                {/* Modern styled file input for automatic 100% discount */}
                <label htmlFor="attach-file" className="ml-4 inline-flex items-center px-4 py-2 bg-[#2a9dab] text-white rounded-lg cursor-pointer hover:bg-[#1f8a96] transition-colors shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.586-7.586a4 4 0 10-5.656-5.656l-7.586 7.586a6 6 0 108.486 8.486" />
                  </svg>
                  Attach File or Picture
                  <input
                    id="attach-file"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setAddPaymentDiscountType('custom');
                        setAddPaymentDiscountValue(100);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Total</span>
                <span className="font-mono text-gray-800">₱{getAddPaymentTotalAfterDiscount().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700">Payment</span>
                <input
                  type="number"
                  value={getAddPaymentTotalAfterDiscount()}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-[#2a9dab] bg-gray-100"
                  readOnly
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-end items-center mt-6 gap-3">
              <button
                onClick={() => setShowCancelPaymentModal(true)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-base font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmPaymentModal(true);
                  setShowAddPaymentModal(false);
                }}
                className="px-8 py-2 bg-[#2a9dab] text-white rounded-lg hover:bg-[#1f8a96] text-base font-bold shadow-md transition-colors"
                style={{ minWidth: '170px' }}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* Confirm Payment Modal */}
      <Modal
        isOpen={showConfirmPaymentModal}
        onClose={() => setShowConfirmPaymentModal(false)}
        onConfirm={async () => {
          setShowConfirmPaymentModal(false);
          await handleAddPaymentSubmit();
        }}
        title="Confirm Payment"
        message="Are you sure you want to add this payment?"
      />
      {/* Cancel Payment Modal */}
      <Modal
        isOpen={showCancelPaymentModal}
        onClose={() => setShowCancelPaymentModal(false)}
        onConfirm={() => {
          setShowCancelPaymentModal(false);
          setShowAddPaymentModal(false);
        }}
        title="Cancel Payment"
        message="Are you sure you want to cancel adding this payment?"
      />
    </div>
  );
};

export default Transaction; 