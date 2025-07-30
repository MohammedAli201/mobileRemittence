


import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useTransaction } from '../../context/TransactionContext';

const { width } = Dimensions.get('window');

const RELATIONSHIPS = [
  { label: 'Spouse', value: 'spouse', icon: 'heart', color: '#FF6B6B' },
  { label: 'Parent', value: 'parent', icon: 'people', color: '#4ECDC4' },
  { label: 'Child', value: 'child', icon: 'people', color: '#45B7D1' },
  { label: 'Sibling', value: 'sibling', icon: 'people', color: '#A78BFA' },
  { label: 'Friend', value: 'friend', icon: 'happy', color: '#F6AD55' },
  { label: 'Business Partner', value: 'business_partner', icon: 'briefcase', color: '#68D391' },
  { label: 'Other Relative', value: 'other_relative', icon: 'people', color: '#F687B3' },
  { label: 'Other', value: 'other', icon: 'help', color: '#CBD5E0' }
];

const REASONS = [
  { label: 'Family Support', value: 'family_support', icon: 'home', color: '#F6AD55' },
  { label: 'Education', value: 'education', icon: 'school', color: '#63B3ED' },
  { label: 'Medical Expenses', value: 'medical', icon: 'medkit', color: '#F687B3' },
  { label: 'Gift', value: 'gift', icon: 'gift', color: '#68D391' },
  { label: 'Business Payment', value: 'business', icon: 'business', color: '#B794F4' },
  { label: 'Personal Savings', value: 'savings', icon: 'wallet', color: '#F6E05E' },
  { label: 'Travel Expenses', value: 'travel', icon: 'airplane', color: '#76E4F7' },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal', color: '#CBD5E0' }
];

const formatNumber = (num) => {
  if (!num) return '0';
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const AgreeAndPayScreen = () => {
  const navigation = useNavigation();
  const { transactionData, updateTransaction } = useTransaction();
  const { recipient: recipientRaw, trans: transRaw } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const recipient = recipientRaw ? JSON.parse(recipientRaw) : {};
  const trans = transRaw ? JSON.parse(transRaw) : {};

  // Pulsing animation for important elements
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ]).start(() => pulse());
    };
    pulse();
    return () => pulseAnim.stopAnimation();
  }, []);

  useEffect(() => {
    if (!trans || !recipient) return;

    const parsedRecipient = {
      firstName: recipient.name || '',
      phoneNumber: recipient.phone || '',
      relationshipToSender: recipient.relationshipToSender || '',
      avatarColor: recipient.avatarColor || getRandomColor(),
    };

    const updatedTransaction = {
      recipient: recipient,
      reason: trans.reason || '',
    };

    updateTransaction(updatedTransaction);
  }, []);

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#A78BFA', '#F6AD55', '#68D391', '#F687B3'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: modalVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: modalVisible ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  const handleConfirm = () => {
    navigation.navigate('PaymentProcessing');
  };

  const initials = `${transactionData.recipient?.firstName || ''} ${transactionData.recipient?.lastName || ''}`
    .trim()
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleSelect = (value, label) => {
    if (modalType === 'relationship') {
      updateTransaction({
        ...transactionData,
        recipient: {
          ...transactionData.recipient,
          relationshipToSender: value
        }
      });
    } else if (modalType === 'reason') {
      updateTransaction({
        ...transactionData,
        reason: value
      });
    }
    closeModal();
  };

  const getCurrentLabel = (type) => {
    if (type === 'relationship') {
      const item = RELATIONSHIPS.find(r => r.value === transactionData.recipient?.relationshipToSender);
      return item ? item.label : 'Select Relationship';
    } else {
      const item = REASONS.find(r => r.value === transactionData.reason);
      return item ? item.label : 'Select Reason';
    }
  };

  const getCurrentIcon = (type) => {
    if (type === 'relationship') {
      const item = RELATIONSHIPS.find(r => r.value === transactionData.recipient?.relationshipToSender);
      return item ? item.icon : 'help';
    } else {
      const item = REASONS.find(r => r.value === transactionData.reason);
      return item ? item.icon : 'help';
    }
  };

  const getCurrentColor = (type) => {
    if (type === 'relationship') {
      const item = RELATIONSHIPS.find(r => r.value === transactionData.recipient?.relationshipToSender);
      return item ? item.color : '#CBD5E0';
    } else {
      const item = REASONS.find(r => r.value === transactionData.reason);
      return item ? item.color : '#CBD5E0';
    }
  };

  const toggleTerms = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const renderModal = () => {
    const data = modalType === 'relationship' ? RELATIONSHIPS : REASONS;
    const currentValue = modalType === 'relationship' 
      ? transactionData.recipient?.relationshipToSender 
      : transactionData.reason;

    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalType === 'relationship' ? 'Who are you sending to?' : 'Why are you sending money?'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#718096" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            {data.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.modalItem,
                  currentValue === item.value && styles.modalItemSelected
                ]}
                onPress={() => handleSelect(item.value, item.label)}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={item.color} 
                  />
                </View>
                <Text style={[
                  styles.modalItemText,
                  currentValue === item.value && styles.modalItemTextSelected
                ]}>
                  {item.label}
                </Text>
                {currentValue === item.value && (
                  <View style={[styles.checkmarkCircle, { backgroundColor: item.color }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#FFFFFF', '#F7FAFF']} 
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Transfer</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Amount Card */}
          <Animated.View 
            style={[
              styles.amountCard,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>You send</Text>
              <Text style={styles.amountValue}>
                {transactionData.sendCurrency} {formatNumber(transactionData.sendAmount)}
              </Text>
            </View>

            <View style={styles.arrowDownContainer}>
              <Ionicons name="swap-vertical" size={24} color="#4299E1" />
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Recipient gets</Text>
              <Text style={[styles.amountValue, { color: '#38A169' }]}>
                {transactionData.receiveCurrency} {formatNumber(transactionData.receiveAmount)}
              </Text>
            </View>
          </Animated.View>

          {/* Recipient Card */}
          <View style={styles.recipientCard}>
            <View style={styles.recipientHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#4299E1" />
              <Text style={styles.recipientTitle}>Recipient Details</Text>
            </View>
            
            <View style={styles.recipientInfo}>
              <View style={[styles.avatar, { backgroundColor: transactionData.recipient?.avatarColor || '#CCCCCC' }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.recipientDetails}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <View style={styles.phoneContainer}>
                  <Ionicons name="call-outline" size={16} color="#718096" />
                  <Text style={styles.phoneNumber}>{recipient.phone || 'Phone not provided'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Transfer Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Ionicons name="document-text-outline" size={24} color="#4299E1" />
              <Text style={styles.detailsTitle}>Transfer Details</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="business-outline" size={20} color="#718096" />
                <Text style={styles.detailLabel}>Provider</Text>
              </View>
              <Text style={styles.detailValue}>{transactionData.provider}</Text>
            </View>

                     <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="business-outline" size={20} color="#718096" />
                <Text style={styles.detailLabel}>Remittance type :</Text>
              </View>
              <Text style={styles.detailValue}>{transactionData.service}</Text>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="people-outline" size={20} color="#718096" />
                <Text style={styles.detailLabel}>Relationship</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.dropdownButton,
                  !transactionData.recipient?.relationshipToSender && styles.dropdownButtonEmpty
                ]}
                onPress={() => openModal('relationship')}
              >
                {transactionData.recipient?.relationshipToSender ? (
                  <>
                    <View style={[styles.relationshipIcon, { backgroundColor: getCurrentColor('relationship') + '20' }]}>
                      <Ionicons 
                        name={getCurrentIcon('relationship')} 
                        size={18} 
                        color={getCurrentColor('relationship')} 
                      />
                    </View>
                    <Text style={styles.dropdownText}>
                      {getCurrentLabel('relationship')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select Relationship</Text>
                )}
                <Ionicons name="chevron-down" size={16} color="#718096" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailLabelContainer}>
                <Ionicons name="document-text-outline" size={20} color="#718096" />
                <Text style={styles.detailLabel}>Purpose</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.dropdownButton,
                  !transactionData.reason && styles.dropdownButtonEmpty
                ]}
                onPress={() => openModal('reason')}
              >
                {transactionData.reason ? (
                  <>
                    <View style={[styles.relationshipIcon, { backgroundColor: getCurrentColor('reason') + '20' }]}>
                      <Ionicons 
                        name={getCurrentIcon('reason')} 
                        size={18} 
                        color={getCurrentColor('reason')} 
                      />
                    </View>
                    <Text style={styles.dropdownText}>
                      {getCurrentLabel('reason')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.dropdownPlaceholder}>Select Purpose</Text>
                )}
                <Ionicons name="chevron-down" size={16} color="#718096" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cost Breakdown */}
          <View style={styles.costCard}>
            <View style={styles.costHeader}>
              <Ionicons name="calculator-outline" size={24} color="#4299E1" />
              <Text style={styles.costTitle}>Cost Breakdown</Text>
            </View>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Transfer amount</Text>
              <Text style={styles.costValue}>
                {transactionData.sendCurrency} {formatNumber(transactionData.sendAmount)}
              </Text>
            </View>
            
            <View style={styles.costRow}>
              <View style={styles.costLabelContainer}>
                <Text style={styles.costLabel}>Transfer fee</Text>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={18} color="#718096" />
                </TouchableOpacity>
              </View>
              <Text style={styles.costValue}>
                {transactionData.sendCurrency} {formatNumber(transactionData.fees)}
              </Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total to pay</Text>
              <Text style={styles.totalAmount}>
                {transactionData.sendCurrency} {formatNumber(transactionData.totalAmount)}
              </Text>
            </View>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              onPress={toggleTerms} 
              style={styles.checkboxContainer}
              activeOpacity={0.8}
            >
              {acceptedTerms ? (
                <LinearGradient 
                  colors={['#4299E1', '#3182CE']}
                  style={styles.checkboxChecked}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                </LinearGradient>
              ) : (
                <View style={styles.checkboxUnchecked} />
              )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (!acceptedTerms || !transactionData.recipient?.relationshipToSender || !transactionData.reason) && 
              styles.continueButtonDisabled
            ]} 
            onPress={handleConfirm} 
            activeOpacity={0.8}
            disabled={!acceptedTerms || !transactionData.recipient?.relationshipToSender || !transactionData.reason}
          >
            <LinearGradient
              colors={['#4299E1', '#3182CE']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Confirm & Pay</Text>
              <Ionicons name="lock-closed" size={18} color="white" style={styles.lockIcon} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {renderModal()}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    flex: 1,
    paddingBottom: 30,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3748',
  },
  arrowDownContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  recipientCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 40,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: width * 0.4,
  },
  dropdownButtonEmpty: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  relationshipIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  costCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  costLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 14,
    color: '#718096',
  },
  infoButton: {
    marginLeft: 6,
  },
  costValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  termsText: {
    fontSize: 14,
    color: '#718096',
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: '#4299E1',
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#3182CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  lockIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    paddingRight: 16,
  },
  modalScroll: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemSelected: {
    backgroundColor: '#F7FAFF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#4299E1',
    fontWeight: '600',
  },
  checkmarkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default AgreeAndPayScreen;