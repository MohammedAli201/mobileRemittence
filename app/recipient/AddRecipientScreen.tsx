// // // import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // import React, { useRef, useState } from 'react';
// // // import { useTransaction } from '../../context/TransactionContext';

// // // import {
// // //   Alert,
// // //   Animated,
// // //   Image,
// // //   Keyboard,
// // //   Platform,
// // //   SafeAreaView,
// // //   ScrollView,
// // //   StyleSheet,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   View
// // // } from 'react-native';
// // // import * as Animatable from 'react-native-animatable';

// // // export default function AddRecipientScreen() {
// // //     const { transactionData, updateTransaction } = useTransaction();
  
// // //   const [form, setForm] = useState({
// // //     mmtAccount: '',
// // //     firstName: '',
// // //     middleName: '',
// // //     lastName: '',
// // //     city: '',
// // //     mobileNumber: '',
// // //     relationship: ''
// // //   });

// // //   const [errors, setErrors] = useState({});
// // //   const [isSubmitting, setIsSubmitting] = useState(false);
// // //   const fadeAnim = useRef(new Animated.Value(0)).current;
// // //   const shakeAnim = useRef(new Animated.Value(0)).current;

// // //   const inputs = useRef([]);

// // //   const focusNextField = (id) => {
// // //     inputs.current[id].focus();
// // //   };

// // //   const validateForm = () => {
// // //     let valid = true;
// // //     const newErrors = {};

// // //     if (!form.mmtAccount.trim()) {
// // //       newErrors.mmtAccount = 'Account number is required';
// // //       valid = false;
// // //     } else if (!/^\d+$/.test(form.mmtAccount)) {
// // //       newErrors.mmtAccount = 'Account number must be numeric';
// // //       valid = false;
// // //     }

// // //     if (!form.firstName.trim()) {
// // //       newErrors.firstName = 'First name is required';
// // //       valid = false;
// // //     }

// // //     if (!form.lastName.trim()) {
// // //       newErrors.lastName = 'Last name is required';
// // //       valid = false;
// // //     }

// // //     if (!form.city.trim()) {
// // //       newErrors.city = 'City is required';
// // //       valid = false;
// // //     }

// // //     if (!form.mobileNumber.trim()) {
// // //       newErrors.mobileNumber = 'Mobile number is required';
// // //       valid = false;
// // //     } else if (!/^[0-9+]+$/.test(form.mobileNumber)) {
// // //       newErrors.mobileNumber = 'Enter a valid mobile number';
// // //       valid = false;
// // //     }

// // //     setErrors(newErrors);
// // //     return valid;
// // //   };

// // //   const handleSubmit = () => {
// // //     Keyboard.dismiss();
    
// // //     if (!validateForm()) {
// // //       // Shake animation for invalid form
// // //       Animated.sequence([
// // //         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// // //         Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
// // //         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// // //         Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
// // //       ]).start();
// // //       return;
// // //     }

// // //     setIsSubmitting(true);
    
// // //     // Simulate API call
// // //     setTimeout(() => {
// // //       setIsSubmitting(false);
// // //       Alert.alert(
// // //         'Success!',
// // //         'Recipient has been saved successfully',
// // //         [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
// // //       );
      
// // //       // Reset form
// // //       setForm({
// // //         mmtAccount: '',
// // //         firstName: '',
// // //         middleName: '',
// // //         lastName: '',
// // //         city: '',
// // //         mobileNumber: '',
// // //         relationship: ''
// // //       });
// // //     }, 1500);
// // //   };

// // //   const animateIn = () => {
// // //     Animated.timing(fadeAnim, {
// // //       toValue: 1,
// // //       duration: 1000,
// // //       useNativeDriver: true
// // //     }).start();
// // //   };

// // //   React.useEffect(() => {
// // //     animateIn();
// // //   }, []);

// // //   return (
// // //     <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
// // //       <Animated.View style={{ opacity: fadeAnim }}>
// // //         <ScrollView 
// // //           contentContainerStyle={styles.container}
// // //           keyboardShouldPersistTaps="handled"
// // //         >
// // //           <Animatable.View 
// // //             animation="fadeInDown" 
// // //             duration={800}
// // //             style={styles.header}
// // //           >
// // //             <Text style={styles.title}>Add New Recipient</Text>
// // //             <Image
// // //               source={require('../../assets/recipient-icon.png')} // Replace with your actual image
// // //               style={styles.headerIcon}
// // //             />
// // //           </Animatable.View>

// // //           <Animatable.View 
// // //             animation="fadeInUp" 
// // //             duration={800}
// // //             delay={200}
// // //             style={styles.noteContainer}
// // //           >
// // //             <MaterialIcons name="info-outline" size={20} color="#3182ce" />
// // //             <Text style={styles.note}>
// // //               Recipient names must match their official ID exactly. Incorrect information may delay or cancel your transfer.
// // //             </Text>
// // //           </Animatable.View>

// // //           <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
// // //             <View style={styles.inputContainer}>
// // //               <FontAwesome name="user-circle-o" size={20} color="#4a5568" style={styles.inputIcon} />
// // //               <TextInput
// // //                 style={[styles.input, errors.mmtAccount && styles.inputError]}
// // //                 placeholder="MMT Account Number"
// // //                 placeholderTextColor="#a0aec0"
// // //                 keyboardType="number-pad"
// // //                 value={form.mmtAccount}
// // //                 onChangeText={(text) => setForm({ ...form, mmtAccount: text })}
// // //                 returnKeyType="next"
// // //                 onSubmitEditing={() => focusNextField(1)}
// // //                 blurOnSubmit={false}
// // //                 ref={ref => inputs.current[0] = ref}
// // //               />
// // //             </View>
// // //             {errors.mmtAccount && <Text style={styles.errorText}>{errors.mmtAccount}</Text>}

// // //             <View style={styles.inputRow}>
// // //               <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
// // //                 <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
// // //                 <TextInput
// // //                   style={[styles.input, errors.firstName && styles.inputError]}
// // //                   placeholder="First Name"
// // //                   placeholderTextColor="#a0aec0"
// // //                   value={form.firstName}
// // //                   onChangeText={(text) => setForm({ ...form, firstName: text })}
// // //                   returnKeyType="next"
// // //                   onSubmitEditing={() => focusNextField(2)}
// // //                   blurOnSubmit={false}
// // //                   ref={ref => inputs.current[1] = ref}
// // //                 />
// // //               </View>
// // //               <View style={[styles.inputContainer, { flex: 1 }]}>
// // //                 <TextInput
// // //                   style={styles.input}
// // //                   placeholder="Middle Name"
// // //                   placeholderTextColor="#a0aec0"
// // //                   value={form.middleName}
// // //                   onChangeText={(text) => setForm({ ...form, middleName: text })}
// // //                   returnKeyType="next"
// // //                   onSubmitEditing={() => focusNextField(3)}
// // //                   blurOnSubmit={false}
// // //                   ref={ref => inputs.current[2] = ref}
// // //                 />
// // //               </View>
// // //             </View>
// // //             {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

// // //             <View style={styles.inputContainer}>
// // //               <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
// // //               <TextInput
// // //                 style={[styles.input, errors.lastName && styles.inputError]}
// // //                 placeholder="Last Name"
// // //                 placeholderTextColor="#a0aec0"
// // //                 value={form.lastName}
// // //                 onChangeText={(text) => setForm({ ...form, lastName: text })}
// // //                 returnKeyType="next"
// // //                 onSubmitEditing={() => focusNextField(4)}
// // //                 blurOnSubmit={false}
// // //                 ref={ref => inputs.current[3] = ref}
// // //               />
// // //             </View>
// // //             {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

// // //             <View style={styles.inputContainer}>
// // //               <Ionicons name="location-outline" size={20} color="#4a5568" style={styles.inputIcon} />
// // //               <TextInput
// // //                 style={[styles.input, errors.city && styles.inputError]}
// // //                 placeholder="City"
// // //                 placeholderTextColor="#a0aec0"
// // //                 value={form.city}
// // //                 onChangeText={(text) => setForm({ ...form, city: text })}
// // //                 returnKeyType="next"
// // //                 onSubmitEditing={() => focusNextField(5)}
// // //                 blurOnSubmit={false}
// // //                 ref={ref => inputs.current[4] = ref}
// // //               />
// // //             </View>
// // //             {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

// // //             <View style={styles.countryContainer}>
// // //               <Ionicons name="earth-outline" size={20} color="#3182ce" />
// // //               <Text style={styles.countryLabel}>Country: Somalia</Text>
// // //             </View>

// // //             <View style={styles.inputContainer}>
// // //               <FontAwesome name="phone" size={20} color="#4a5568" style={styles.inputIcon} />
// // //               <TextInput
// // //                 style={[styles.input, errors.mobileNumber && styles.inputError]}
// // //                 placeholder="Mobile Number"
// // //                 placeholderTextColor="#a0aec0"
// // //                 keyboardType="phone-pad"
// // //                 value={form.mobileNumber}
// // //                 onChangeText={(text) => setForm({ ...form, mobileNumber: text })}
// // //                 returnKeyType="next"
// // //                 onSubmitEditing={() => focusNextField(6)}
// // //                 blurOnSubmit={false}
// // //                 ref={ref => inputs.current[5] = ref}
// // //               />
// // //             </View>
// // //             {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

// // //             <View style={styles.inputContainer}>
// // //               <FontAwesome name="handshake-o" size={18} color="#4a5568" style={styles.inputIcon} />
// // //               <TextInput
// // //                 style={styles.input}
// // //                 placeholder="Relationship (Optional)"
// // //                 placeholderTextColor="#a0aec0"
// // //                 value={form.relationship}
// // //                 onChangeText={(text) => setForm({ ...form, relationship: text })}
// // //                 returnKeyType="done"
// // //                 onSubmitEditing={handleSubmit}
// // //                 ref={ref => inputs.current[6] = ref}
// // //               />
// // //             </View>
// // //           </Animated.View>

// // //           <Animatable.View 
// // //             animation="fadeInUp" 
// // //             duration={800}
// // //             delay={400}
// // //             style={styles.warningContainer}
// // //           >
// // //             <MaterialIcons name="warning" size={20} color="#dd6b20" />
// // //            <Text style={styles.warning}>
// // //   Customers cannot send money to businesses{'\n'}
// // //   <Text style={{ fontFamily: 'Roboto' }}>
// // //     Macaamiishu lacag uma diri karaan shirkad
// // //   </Text>
// // // </Text>

// // //           </Animatable.View>

// // //           <Animatable.View 
// // //             animation="fadeInUp" 
// // //             duration={800}
// // //             delay={600}
// // //           >
// // //             <TouchableOpacity 
// // //               style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
// // //               onPress={handleSubmit}
// // //               disabled={isSubmitting}
// // //               activeOpacity={0.8}
// // //             >
// // //               {isSubmitting ? (
// // //                 <ActivityIndicator color="#fff" />
// // //               ) : (
// // //                 <>
// // //                   <FontAwesome name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
// // //                   <Text style={styles.submitText}>Save Recipient</Text>
// // //                 </>
// // //               )}
// // //             </TouchableOpacity>
// // //           </Animatable.View>
// // //         </ScrollView>
// // //       </Animated.View>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     padding: 24,
// // //     paddingBottom: 40
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 24
// // //   },
// // //   title: {
// // //     fontSize: 24,
// // //     fontWeight: '700',
// // //     color: '#2d3748'
// // //   },
// // //   headerIcon: {
// // //     width: 40,
// // //     height: 40
// // //   },
// // //   noteContainer: {
// // //     flexDirection: 'row',
// // //     backgroundColor: '#ebf8ff',
// // //     padding: 16,
// // //     borderRadius: 12,
// // //     marginBottom: 20,
// // //     alignItems: 'flex-start'
// // //   },
// // //   note: {
// // //     flex: 1,
// // //     marginLeft: 10,
// // //     color: '#2b6cb0',
// // //     fontSize: 14,
// // //     lineHeight: 20
// // //   },
// // //   inputContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#fff',
// // //     borderWidth: 1,
// // //     borderColor: '#e2e8f0',
// // //     borderRadius: 12,
// // //     paddingHorizontal: 16,
// // //     marginVertical: 6,
// // //     ...Platform.select({
// // //       ios: {
// // //         shadowColor: '#000',
// // //         shadowOffset: { width: 0, height: 2 },
// // //         shadowOpacity: 0.1,
// // //         shadowRadius: 4,
// // //       },
// // //       android: {
// // //         elevation: 2,
// // //       },
// // //     }),
// // //   },
// // //   inputIcon: {
// // //     marginRight: 12
// // //   },
// // //   input: {
// // //     flex: 1,
// // //     height: 50,
// // //     color: '#1a202c',
// // //     fontSize: 16
// // //   },
// // //   inputError: {
// // //     borderColor: '#e53e3e'
// // //   },
// // //   inputRow: {
// // //     flexDirection: 'row',
// // //     marginBottom: 6
// // //   },
// // //   errorText: {
// // //     color: '#e53e3e',
// // //     fontSize: 12,
// // //     marginBottom: 8,
// // //     marginLeft: 8
// // //   },
// // //   countryContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginTop: 12,
// // //     marginBottom: 6,
// // //     paddingLeft: 8
// // //   },
// // //   countryLabel: {
// // //     marginLeft: 10,
// // //     fontSize: 16,
// // //     color: '#4a5568',
// // //     fontWeight: '600'
// // //   },
// // //   warningContainer: {
// // //     flexDirection: 'row',
// // //     backgroundColor: '#fffaf0',
// // //     padding: 16,
// // //     borderRadius: 12,
// // //     marginTop: 20,
// // //     alignItems: 'flex-start',
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#dd6b20'
// // //   },
// // //   warning: {
// // //     flex: 1,
// // //     marginLeft: 10,
// // //     color: '#9c4221',
// // //     fontSize: 14,
// // //     lineHeight: 20
// // //   },
// // //   submitButton: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#3182ce',
// // //     marginTop: 24,
// // //     padding: 16,
// // //     borderRadius: 12,
// // //     ...Platform.select({
// // //       ios: {
// // //         shadowColor: '#3182ce',
// // //         shadowOffset: { width: 0, height: 4 },
// // //         shadowOpacity: 0.3,
// // //         shadowRadius: 6,
// // //       },
// // //       android: {
// // //         elevation: 4,
// // //       },
// // //     }),
// // //   },
// // //   submitButtonDisabled: {
// // //     backgroundColor: '#a0aec0'
// // //   },
// // //   submitText: {
// // //     color: '#fff',
// // //     fontSize: 18,
// // //     fontWeight: '600'
// // //   }
// // // });


// // import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import React, { useRef, useState } from 'react';
// // import {
// //   ActivityIndicator,
// //   Alert,
// //   Animated,
// //   Image,
// //   Keyboard,
// //   Platform,
// //   SafeAreaView,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   View
// // } from 'react-native';
// // import * as Animatable from 'react-native-animatable';
// // import { useTransaction } from '../../context/TransactionContext';

// // // Country data utility
// // const countryData = {
// //   somalia: {
// //     name: 'Somalia',
// //     flag: '🇸🇴',
// //     phoneCode: '+252',
// //     currency: 'SOS'
// //   },
// //   kenya: {
// //     name: 'Kenya',
// //     flag: '🇰🇪',
// //     phoneCode: '+254',
// //     currency: 'KES'
// //   },
// //   // Add more countries as needed
// // };

// // export default function AddRecipientScreen() {
// //   const { transactionData, updateTransaction } = useTransaction();
  
// //   const countryInfo = countryData[transactionData.receivingCountry?.toLowerCase()] || countryData.somalia;
  
// //   const [form, setForm] = useState({
// //     mmtAccount: '',
// //     firstName: '',
// //     middleName: '',
// //     lastName: '',
// //     city: '',
// //     mobileNumber: '',
// //     relationship: ''
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const shakeAnim = useRef(new Animated.Value(0)).current;

// //   const inputs = useRef([]);

// //   const focusNextField = (id) => {
// //     inputs.current[id].focus();
// //   };

// //   const formatPhoneNumber = (text) => {
// //     // Remove all non-digit characters
// //     let cleaned = text.replace(/\D/g, '');
    
// //     // Somalia specific formatting (7XX XXX XXX)
// //     if (cleaned.length > 0) {
// //       cleaned = cleaned.substring(0, 9); // Limit to 9 digits
      
// //       if (cleaned.length > 3) {
// //         cleaned = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
// //       }
// //     }
    
// //     return cleaned;
// //   };

// //   const validateForm = () => {
// //     let valid = true;
// //     const newErrors = {};

// //     if (!form.mmtAccount.trim()) {
// //       newErrors.mmtAccount = 'Account number is required';
// //       valid = false;
// //     } else if (!/^\d+$/.test(form.mmtAccount)) {
// //       newErrors.mmtAccount = 'Account number must be numeric';
// //       valid = false;
// //     }

// //     if (!form.firstName.trim()) {
// //       newErrors.firstName = 'First name is required';
// //       valid = false;
// //     }

// //     if (!form.lastName.trim()) {
// //       newErrors.lastName = 'Last name is required';
// //       valid = false;
// //     }

// //     if (!form.city.trim()) {
// //       newErrors.city = 'City is required';
// //       valid = false;
// //     }

// //     if (!form.mobileNumber.trim()) {
// //       newErrors.mobileNumber = 'Mobile number is required';
// //       valid = false;
// //     } else if (form.mobileNumber.replace(/\s/g, '').length < 9) {
// //       newErrors.mobileNumber = 'Enter a valid 9-digit mobile number';
// //       valid = false;
// //     }

// //     setErrors(newErrors);
// //     return valid;
// //   };

// //   const handleSubmit = () => {
// //     Keyboard.dismiss();
    
// //     if (!validateForm()) {
// //       Animated.sequence([
// //         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// //         Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
// //         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
// //         Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
// //       ]).start();
// //       return;
// //     }

// //     setIsSubmitting(true);
    
// //     setTimeout(() => {
// //       setIsSubmitting(false);
// //       Alert.alert(
// //         'Success!',
// //         'Recipient has been saved successfully',
// //         [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
// //       );
      
// //       setForm({
// //         mmtAccount: '',
// //         firstName: '',
// //         middleName: '',
// //         lastName: '',
// //         city: '',
// //         mobileNumber: '',
// //         relationship: ''
// //       });
// //     }, 1500);
// //   };

// //   const animateIn = () => {
// //     Animated.timing(fadeAnim, {
// //       toValue: 1,
// //       duration: 1000,
// //       useNativeDriver: true
// //     }).start();
// //   };

// //   React.useEffect(() => {
// //     animateIn();
// //   }, []);

// //   return (
// //     <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
// //       <Animated.View style={{ opacity: fadeAnim }}>
// //         <ScrollView 
// //           contentContainerStyle={styles.container}
// //           keyboardShouldPersistTaps="handled"
// //         >
// //           <Animatable.View 
// //             animation="fadeInDown" 
// //             duration={800}
// //             style={styles.header}
// //           >
// //             <Text style={styles.title}>Add New Recipient</Text>
// //             <Image
// //               source={require('../../assets/recipient-icon.png')}
// //               style={styles.headerIcon}
// //             />
// //           </Animatable.View>

// //           <Animatable.View 
// //             animation="fadeInUp" 
// //             duration={800}
// //             delay={200}
// //             style={styles.noteContainer}
// //           >
// //             <MaterialIcons name="info-outline" size={20} color="#3182ce" />
// //             <Text style={styles.note}>
// //               Recipient names must match their official ID exactly. Incorrect information may delay or cancel your transfer.
// //             </Text>
// //           </Animatable.View>

// //           <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
// //             <View style={styles.inputContainer}>
// //               <FontAwesome name="user-circle-o" size={20} color="#4a5568" style={styles.inputIcon} />
// //               <TextInput
// //                 style={[styles.input, errors.mmtAccount && styles.inputError]}
// //                 placeholder="MMT Account Number"
// //                 placeholderTextColor="#a0aec0"
// //                 keyboardType="number-pad"
// //                 value={form.mmtAccount}
// //                 onChangeText={(text) => setForm({ ...form, mmtAccount: text })}
// //                 returnKeyType="next"
// //                 onSubmitEditing={() => focusNextField(1)}
// //                 blurOnSubmit={false}
// //                 ref={ref => inputs.current[0] = ref}
// //               />
// //             </View>
// //             {errors.mmtAccount && <Text style={styles.errorText}>{errors.mmtAccount}</Text>}

// //             <View style={styles.inputRow}>
// //               <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
// //                 <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
// //                 <TextInput
// //                   style={[styles.input, errors.firstName && styles.inputError]}
// //                   placeholder="First Name"
// //                   placeholderTextColor="#a0aec0"
// //                   value={form.firstName}
// //                   onChangeText={(text) => setForm({ ...form, firstName: text })}
// //                   returnKeyType="next"
// //                   onSubmitEditing={() => focusNextField(2)}
// //                   blurOnSubmit={false}
// //                   ref={ref => inputs.current[1] = ref}
// //                 />
// //               </View>
// //               <View style={[styles.inputContainer, { flex: 1 }]}>
// //                 <TextInput
// //                   style={styles.input}
// //                   placeholder="Middle Name"
// //                   placeholderTextColor="#a0aec0"
// //                   value={form.middleName}
// //                   onChangeText={(text) => setForm({ ...form, middleName: text })}
// //                   returnKeyType="next"
// //                   onSubmitEditing={() => focusNextField(3)}
// //                   blurOnSubmit={false}
// //                   ref={ref => inputs.current[2] = ref}
// //                 />
// //               </View>
// //             </View>
// //             {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

// //             <View style={styles.inputContainer}>
// //               <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
// //               <TextInput
// //                 style={[styles.input, errors.lastName && styles.inputError]}
// //                 placeholder="Last Name"
// //                 placeholderTextColor="#a0aec0"
// //                 value={form.lastName}
// //                 onChangeText={(text) => setForm({ ...form, lastName: text })}
// //                 returnKeyType="next"
// //                 onSubmitEditing={() => focusNextField(4)}
// //                 blurOnSubmit={false}
// //                 ref={ref => inputs.current[3] = ref}
// //               />
// //             </View>
// //             {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

// //             <View style={styles.inputContainer}>
// //               <Ionicons name="location-outline" size={20} color="#4a5568" style={styles.inputIcon} />
// //               <TextInput
// //                 style={[styles.input, errors.city && styles.inputError]}
// //                 placeholder="City"
// //                 placeholderTextColor="#a0aec0"
// //                 value={form.city}
// //                 onChangeText={(text) => setForm({ ...form, city: text })}
// //                 returnKeyType="next"
// //                 onSubmitEditing={() => focusNextField(5)}
// //                 blurOnSubmit={false}
// //                 ref={ref => inputs.current[4] = ref}
// //               />
// //             </View>
// //             {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

// //             <View style={styles.countryContainer}>
// //               <Text style={styles.countryFlag}>{countryInfo.flag}</Text>
// //               <View>
// //                 <Text style={styles.countryLabel}>{countryInfo.name}</Text>
// //                 <Text style={styles.countrySubLabel}>Country Code: {countryInfo.phoneCode}</Text>
// //               </View>
// //             </View>

// //             <View style={styles.inputContainer}>
// //               <View style={styles.phoneCodeContainer}>
// //                 <Text style={styles.phoneCodeText}>{countryInfo.phoneCode}</Text>
// //               </View>
// //               <FontAwesome name="phone" size={20} color="#4a5568" style={styles.inputIcon} />
// //               <TextInput
// //                 style={[styles.input, errors.mobileNumber && styles.inputError]}
// //                 placeholder="7XX XXX XXX"
// //                 placeholderTextColor="#a0aec0"
// //                 keyboardType="phone-pad"
// //                 value={form.mobileNumber}
// //                 onChangeText={(text) => setForm({ ...form, mobileNumber: formatPhoneNumber(text) })}
// //                 returnKeyType="next"
// //                 onSubmitEditing={() => focusNextField(6)}
// //                 blurOnSubmit={false}
// //                 ref={ref => inputs.current[5] = ref}
// //               />
// //             </View>
// //             {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

// //             <View style={styles.inputContainer}>
// //               <FontAwesome name="handshake-o" size={18} color="#4a5568" style={styles.inputIcon} />
// //               <TextInput
// //                 style={styles.input}
// //                 placeholder="Relationship (Optional)"
// //                 placeholderTextColor="#a0aec0"
// //                 value={form.relationship}
// //                 onChangeText={(text) => setForm({ ...form, relationship: text })}
// //                 returnKeyType="done"
// //                 onSubmitEditing={handleSubmit}
// //                 ref={ref => inputs.current[6] = ref}
// //               />
// //             </View>
// //           </Animated.View>

// //           <Animatable.View 
// //             animation="fadeInUp" 
// //             duration={800}
// //             delay={400}
// //             style={styles.warningContainer}
// //           >
// //             <MaterialIcons name="warning" size={20} color="#dd6b20" />
// //             <Text style={styles.warning}>
// //               Customers cannot send money to businesses{'\n'}
// //               <Text style={{ fontFamily: 'Roboto' }}>
// //                 Macaamiishu lacag uma diri karaan shirkad
// //               </Text>
// //             </Text>
// //           </Animatable.View>

// //           <Animatable.View 
// //             animation="fadeInUp" 
// //             duration={800}
// //             delay={600}
// //           >
// //             <TouchableOpacity 
// //               style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
// //               onPress={handleSubmit}
// //               disabled={isSubmitting}
// //               activeOpacity={0.8}
// //             >
// //               {isSubmitting ? (
// //                 <ActivityIndicator color="#fff" />
// //               ) : (
// //                 <>
// //                   <FontAwesome name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
// //                   <Text style={styles.submitText}>Save Recipient</Text>
// //                 </>
// //               )}
// //             </TouchableOpacity>
// //           </Animatable.View>
// //         </ScrollView>
// //       </Animated.View>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     padding: 24,
// //     paddingBottom: 40
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 24
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: '700',
// //     color: '#2d3748'
// //   },
// //   headerIcon: {
// //     width: 40,
// //     height: 40
// //   },
// //   noteContainer: {
// //     flexDirection: 'row',
// //     backgroundColor: '#ebf8ff',
// //     padding: 16,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //     alignItems: 'flex-start'
// //   },
// //   note: {
// //     flex: 1,
// //     marginLeft: 10,
// //     color: '#2b6cb0',
// //     fontSize: 14,
// //     lineHeight: 20
// //   },
// //   inputContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#fff',
// //     borderWidth: 1,
// //     borderColor: '#e2e8f0',
// //     borderRadius: 12,
// //     paddingHorizontal: 16,
// //     marginVertical: 6,
// //     ...Platform.select({
// //       ios: {
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 4,
// //       },
// //       android: {
// //         elevation: 2,
// //       },
// //     }),
// //   },
// //   inputIcon: {
// //     marginRight: 12
// //   },
// //   input: {
// //     flex: 1,
// //     height: 50,
// //     color: '#1a202c',
// //     fontSize: 16
// //   },
// //   inputError: {
// //     borderColor: '#e53e3e'
// //   },
// //   inputRow: {
// //     flexDirection: 'row',
// //     marginBottom: 6
// //   },
// //   errorText: {
// //     color: '#e53e3e',
// //     fontSize: 12,
// //     marginBottom: 8,
// //     marginLeft: 8
// //   },
// //   countryContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 12,
// //     marginBottom: 6,
// //     padding: 12,
// //     backgroundColor: '#f8fafc',
// //     borderRadius: 8,
// //     borderWidth: 1,
// //     borderColor: '#e2e8f0'
// //   },
// //   countryFlag: {
// //     fontSize: 24,
// //     marginRight: 12
// //   },
// //   countryLabel: {
// //     fontSize: 16,
// //     color: '#2d3748',
// //     fontWeight: '600'
// //   },
// //   countrySubLabel: {
// //     fontSize: 14,
// //     color: '#718096'
// //   },
// //   phoneCodeContainer: {
// //     backgroundColor: '#edf2f7',
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //     borderRadius: 6,
// //     marginRight: 8
// //   },
// //   phoneCodeText: {
// //     color: '#4a5568',
// //     fontWeight: '600',
// //     fontSize: 14
// //   },
// //   warningContainer: {
// //     flexDirection: 'row',
// //     backgroundColor: '#fffaf0',
// //     padding: 16,
// //     borderRadius: 12,
// //     marginTop: 20,
// //     alignItems: 'flex-start',
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#dd6b20'
// //   },
// //   warning: {
// //     flex: 1,
// //     marginLeft: 10,
// //     color: '#9c4221',
// //     fontSize: 14,
// //     lineHeight: 20
// //   },
// //   submitButton: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#3182ce',
// //     marginTop: 24,
// //     padding: 16,
// //     borderRadius: 12,
// //     ...Platform.select({
// //       ios: {
// //         shadowColor: '#3182ce',
// //         shadowOffset: { width: 0, height: 4 },
// //         shadowOpacity: 0.3,
// //         shadowRadius: 6,
// //       },
// //       android: {
// //         elevation: 4,
// //       },
// //     }),
// //   },
// //   submitButtonDisabled: {
// //     backgroundColor: '#a0aec0'
// //   },
// //   submitText: {
// //     color: '#fff',
// //     fontSize: 18,
// //     fontWeight: '600'
// //   }
// // });



// import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
// import React, { useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Image,
//   Keyboard,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import * as Animatable from 'react-native-animatable';
// import { useTransaction } from '../../context/TransactionContext';

// // Country data utility
// const countryData = {
//   somalia: {
//     name: 'Somalia',
//     flag: '🇸🇴',
//     phoneCode: '+252',
//     currency: 'SOS'
//   },
//   kenya: {
//     name: 'Kenya',
//     flag: '🇰🇪',
//     phoneCode: '+254',
//     currency: 'KES'
//   },
//   // Add more countries as needed
// };

// export default function AddRecipientScreen() {
//   const { transactionData, updateTransaction } = useTransaction();
  
//   const countryInfo = countryData[transactionData.receivingCountry?.toLowerCase()] || countryData.somalia;
  
//   const [form, setForm] = useState({
//     mmtAccount: '',
//     firstName: '',
//     middleName: '',
//     lastName: '',
//     city: '',
//     mobileNumber: '',
//     relationship: ''
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const shakeAnim = useRef(new Animated.Value(0)).current;

//   const inputs = useRef([]);

//   const focusNextField = (id) => {
//     inputs.current[id].focus();
//   };

//   const formatPhoneNumber = (text) => {
//     // Remove all non-digit characters
//     let cleaned = text.replace(/\D/g, '');
    
//     // Somalia specific formatting (7XX XXX XXX)
//     if (cleaned.length > 0) {
//       cleaned = cleaned.substring(0, 9); // Limit to 9 digits
      
//       if (cleaned.length > 3) {
//         cleaned = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
//       }
//     }
    
//     return cleaned;
//   };

//   const validateForm = () => {
//     let valid = true;
//     const newErrors = {};

//     if (!form.mmtAccount.trim()) {
//       newErrors.mmtAccount = 'Account number is required';
//       valid = false;
//     } else if (!/^\d+$/.test(form.mmtAccount)) {
//       newErrors.mmtAccount = 'Account number must be numeric';
//       valid = false;
//     }

//     if (!form.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//       valid = false;
//     }

//     if (!form.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//       valid = false;
//     }

//     if (!form.city.trim()) {
//       newErrors.city = 'City is required';
//       valid = false;
//     }

//     if (!form.mobileNumber.trim()) {
//       newErrors.mobileNumber = 'Mobile number is required';
//       valid = false;
//     } else if (form.mobileNumber.replace(/\s/g, '').length < 9) {
//       newErrors.mobileNumber = 'Enter a valid 9-digit mobile number';
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleSubmit = () => {
//     Keyboard.dismiss();
    
//     if (!validateForm()) {
//       Animated.sequence([
//         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
//         Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
//         Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
//         Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
//       ]).start();
//       return;
//     }

//     setIsSubmitting(true);
    
//     setTimeout(() => {
//       setIsSubmitting(false);
//       Alert.alert(
//         'Success!',
//         'Recipient has been saved successfully',
//         [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
//       );
      
//       setForm({
//         mmtAccount: '',
//         firstName: '',
//         middleName: '',
//         lastName: '',
//         city: '',
//         mobileNumber: '',
//         relationship: ''
//       });
//     }, 1500);
//   };

//   const animateIn = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true
//     }).start();
//   };

//   React.useEffect(() => {
//     animateIn();
//   }, []);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
//       <Animated.View style={{ opacity: fadeAnim }}>
//         <ScrollView 
//           contentContainerStyle={styles.container}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Animatable.View 
//             animation="fadeInDown" 
//             duration={800}
//             style={styles.header}
//           >
//             <Text style={styles.title}>Add New Recipient</Text>
//             <Image
//               source={require('../../assets/recipient-icon.png')}
//               style={styles.headerIcon}
//             />
//           </Animatable.View>

//           <Animatable.View 
//             animation="fadeInUp" 
//             duration={800}
//             delay={200}
//             style={styles.noteContainer}
//           >
//             <MaterialIcons name="info-outline" size={20} color="#3182ce" />
//             <Text style={styles.note}>
//               Recipient names must match their official ID exactly. Incorrect information may delay or cancel your transfer.
//             </Text>
//           </Animatable.View>

//           <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
//             <View style={styles.inputContainer}>
//               <FontAwesome name="user-circle-o" size={20} color="#4a5568" style={styles.inputIcon} />
//               <TextInput
//                 style={[styles.input, errors.mmtAccount && styles.inputError]}
//                 placeholder="MMT Account Number"
//                 placeholderTextColor="#a0aec0"
//                 keyboardType="number-pad"
//                 value={form.mmtAccount}
//                 onChangeText={(text) => setForm({ ...form, mmtAccount: text })}
//                 returnKeyType="next"
//                 onSubmitEditing={() => focusNextField(1)}
//                 blurOnSubmit={false}
//                 ref={ref => inputs.current[0] = ref}
//               />
//             </View>
//             {errors.mmtAccount && <Text style={styles.errorText}>{errors.mmtAccount}</Text>}

//             <View style={styles.inputRow}>
//               <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
//                 <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
//                 <TextInput
//                   style={[styles.input, errors.firstName && styles.inputError]}
//                   placeholder="First Name"
//                   placeholderTextColor="#a0aec0"
//                   value={form.firstName}
//                   onChangeText={(text) => setForm({ ...form, firstName: text })}
//                   returnKeyType="next"
//                   onSubmitEditing={() => focusNextField(2)}
//                   blurOnSubmit={false}
//                   ref={ref => inputs.current[1] = ref}
//                 />
//               </View>
//               <View style={[styles.inputContainer, { flex: 1 }]}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Middle Name"
//                   placeholderTextColor="#a0aec0"
//                   value={form.middleName}
//                   onChangeText={(text) => setForm({ ...form, middleName: text })}
//                   returnKeyType="next"
//                   onSubmitEditing={() => focusNextField(3)}
//                   blurOnSubmit={false}
//                   ref={ref => inputs.current[2] = ref}
//                 />
//               </View>
//             </View>
//             {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

//             <View style={styles.inputContainer}>
//               <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
//               <TextInput
//                 style={[styles.input, errors.lastName && styles.inputError]}
//                 placeholder="Last Name"
//                 placeholderTextColor="#a0aec0"
//                 value={form.lastName}
//                 onChangeText={(text) => setForm({ ...form, lastName: text })}
//                 returnKeyType="next"
//                 onSubmitEditing={() => focusNextField(4)}
//                 blurOnSubmit={false}
//                 ref={ref => inputs.current[3] = ref}
//               />
//             </View>
//             {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

//             <View style={styles.inputContainer}>
//               <Ionicons name="location-outline" size={20} color="#4a5568" style={styles.inputIcon} />
//               <TextInput
//                 style={[styles.input, errors.city && styles.inputError]}
//                 placeholder="City"
//                 placeholderTextColor="#a0aec0"
//                 value={form.city}
//                 onChangeText={(text) => setForm({ ...form, city: text })}
//                 returnKeyType="next"
//                 onSubmitEditing={() => focusNextField(5)}
//                 blurOnSubmit={false}
//                 ref={ref => inputs.current[4] = ref}
//               />
//             </View>
//             {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

//             <View style={styles.phoneInputContainer}>
//               <View style={styles.phonePrefixContainer}>
//                 <Text style={styles.phonePrefixFlag}>{countryInfo.flag}</Text>
//                 <Text style={styles.phonePrefixCode}>{countryInfo.phoneCode}</Text>
//               </View>
//               <View style={styles.phoneNumberInput}>
//                 <FontAwesome name="phone" size={20} color="#4a5568" style={styles.inputIcon} />
//                 <TextInput
//                   style={[styles.input, errors.mobileNumber && styles.inputError]}
//                   placeholder="7XX XXX XXX"
//                   placeholderTextColor="#a0aec0"
//                   keyboardType="phone-pad"
//                   value={form.mobileNumber}
//                   onChangeText={(text) => setForm({ ...form, mobileNumber: formatPhoneNumber(text) })}
//                   returnKeyType="next"
//                   onSubmitEditing={() => focusNextField(6)}
//                   blurOnSubmit={false}
//                   ref={ref => inputs.current[5] = ref}
//                 />
//               </View>
//             </View>
//             {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

//             <View style={styles.inputContainer}>
//               <FontAwesome name="handshake-o" size={18} color="#4a5568" style={styles.inputIcon} />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Relationship (Optional)"
//                 placeholderTextColor="#a0aec0"
//                 value={form.relationship}
//                 onChangeText={(text) => setForm({ ...form, relationship: text })}
//                 returnKeyType="done"
//                 onSubmitEditing={handleSubmit}
//                 ref={ref => inputs.current[6] = ref}
//               />
//             </View>
//           </Animated.View>

//           <Animatable.View 
//             animation="fadeInUp" 
//             duration={800}
//             delay={400}
//             style={styles.warningContainer}
//           >
//             <MaterialIcons name="warning" size={20} color="#dd6b20" />
//             <Text style={styles.warning}>
//               Customers cannot send money to businesses{'\n'}
//               <Text style={{ fontFamily: 'Roboto' }}>
//                 Macaamiishu lacag uma diri karaan shirkad
//               </Text>
//             </Text>
//           </Animatable.View>

//           <Animatable.View 
//             animation="fadeInUp" 
//             duration={800}
//             delay={600}
//           >
//             <TouchableOpacity 
//               style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
//               onPress={handleSubmit}
//               disabled={isSubmitting}
//               activeOpacity={0.8}
//             >
//               {isSubmitting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <FontAwesome name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
//                   <Text style={styles.submitText}>Save Recipient</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </Animatable.View>
//         </ScrollView>
//       </Animated.View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     paddingBottom: 40
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#2d3748'
//   },
//   headerIcon: {
//     width: 40,
//     height: 40
//   },
//   noteContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#ebf8ff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 20,
//     alignItems: 'flex-start'
//   },
//   note: {
//     flex: 1,
//     marginLeft: 10,
//     color: '#2b6cb0',
//     fontSize: 14,
//     lineHeight: 20
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     marginVertical: 6,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   phoneInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 6,
//   },
//   phonePrefixContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderTopLeftRadius: 12,
//     borderBottomLeftRadius: 12,
//     paddingHorizontal: 16,
//     height: 50,
//     marginRight: 1,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   phonePrefixFlag: {
//     fontSize: 20,
//     marginRight: 8,
//   },
//   phonePrefixCode: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a202c',
//   },
//   phoneNumberInput: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     borderTopRightRadius: 12,
//     borderBottomRightRadius: 12,
//     paddingHorizontal: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   inputIcon: {
//     marginRight: 12
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     color: '#1a202c',
//     fontSize: 16
//   },
//   inputError: {
//     borderColor: '#e53e3e'
//   },
//   inputRow: {
//     flexDirection: 'row',
//     marginBottom: 6
//   },
//   errorText: {
//     color: '#e53e3e',
//     fontSize: 12,
//     marginBottom: 8,
//     marginLeft: 8
//   },
//   countryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     marginBottom: 6,
//     padding: 12,
//     backgroundColor: '#f8fafc',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0'
//   },
//   countryFlag: {
//     fontSize: 24,
//     marginRight: 12
//   },
//   countryLabel: {
//     fontSize: 16,
//     color: '#2d3748',
//     fontWeight: '600'
//   },
//   countrySubLabel: {
//     fontSize: 14,
//     color: '#718096'
//   },
//   warningContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#fffaf0',
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 20,
//     alignItems: 'flex-start',
//     borderLeftWidth: 4,
//     borderLeftColor: '#dd6b20'
//   },
//   warning: {
//     flex: 1,
//     marginLeft: 10,
//     color: '#9c4221',
//     fontSize: 14,
//     lineHeight: 20
//   },
//   submitButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#3182ce',
//     marginTop: 24,
//     padding: 16,
//     borderRadius: 12,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#3182ce',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#a0aec0'
//   },
//   submitText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600'
//   }
// });



import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTransaction } from '../../context/TransactionContext';

// Dummy data simulating an API response
const dummyRecipients = {
  '615738865': {
    phoneNumber: '+252615738865',
    firstName: 'Shukri',
    lastName: 'Abdi',
    city: 'Mogadishu'
  },
  '617894561': {
    phoneNumber: '+252617894561',
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    city: 'Hargeisa'
  },
  '618912345': {
    phoneNumber: '+252618912345',
    firstName: 'Aisha',
    lastName: 'Hassan',
    city: 'Kismayo'
  }
};

// Country data utility
const countryData = {
  somalia: {
    name: 'Somalia',
    flag: '🇸🇴',
    phoneCode: '+252',
    currency: 'SOS'
  },
  kenya: {
    name: 'Kenya',
    flag: '🇰🇪',
    phoneCode: '+254',
    currency: 'KES'
  },
};

export default function AddRecipientScreen() {
  const { transactionData, updateTransaction } = useTransaction();
  
  const countryInfo = countryData[transactionData.receivingCountry?.toLowerCase()] || countryData.somalia;
  
  const [form, setForm] = useState({
    mmtAccount: '',
    firstName: '',
    middleName: '',
    lastName: '',
    city: '',
    mobileNumber: '',
    relationship: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const inputs = useRef([]);

  // Auto-fill form when MMT account number matches dummy data
  useEffect(() => {
    if (form.mmtAccount.length >= 6) { // Assuming account numbers are 6 digits
      console.log("dummy data",form.mmtAccount)

      const recipientData = dummyRecipients[form.mmtAccount];
      if (recipientData) {
        setForm(prev => ({
          ...prev,
          firstName: recipientData.firstName,
          lastName: recipientData.lastName,
          city: recipientData.city,
          mobileNumber: recipientData.phoneNumber.replace('+252', '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
        }));
      }
    }
  }, [form.mmtAccount]);

  const focusNextField = (id) => {
    inputs.current[id].focus();
  };

  const formatPhoneNumber = (text) => {
    // Remove all non-digit characters
    let cleaned = text.replace(/\D/g, '');
    
    // Somalia specific formatting (7XX XXX XXX)
    if (cleaned.length > 0) {
      cleaned = cleaned.substring(0, 9); // Limit to 9 digits
      
      if (cleaned.length > 3) {
        cleaned = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)}`;
      }
    }
    
    return cleaned;
  };

  const formatAccountNumber = (text) => {
    // Remove all non-digit characters
    return text.replace(/\D/g, '');
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!form.mmtAccount.trim()) {
      newErrors.mmtAccount = 'Account number is required';
      valid = false;
    } else if (!/^\d+$/.test(form.mmtAccount)) {
      newErrors.mmtAccount = 'Account number must be numeric';
      valid = false;
    } else if (form.mmtAccount.length < 6) {
      newErrors.mmtAccount = 'Account number must be 6 digits';
      valid = false;
    }

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    if (!form.city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }

    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      valid = false;
    } else if (form.mobileNumber.replace(/\s/g, '').length < 9) {
      newErrors.mobileNumber = 'Enter a valid 9-digit mobile number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
      ]).start();
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Success!',
        'Recipient has been saved successfully',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
      
      setForm({
        mmtAccount: '',
        firstName: '',
        middleName: '',
        lastName: '',
        city: '',
        mobileNumber: '',
        relationship: ''
      });
    }, 1500);
  };

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  };

  React.useEffect(() => {
    animateIn();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View 
            animation="fadeInDown" 
            duration={800}
            style={styles.header}
          >
            <Text style={styles.title}>Add New Recipient</Text>
            <Image
              source={require('../../assets/recipient-icon.png')}
              style={styles.headerIcon}
            />
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={200}
            style={styles.noteContainer}
          >
            <MaterialIcons name="info-outline" size={20} color="#3182ce" />
            <Text style={styles.note}>
              Recipient names must match their official ID exactly. Incorrect information may delay or cancel your transfer.
            </Text>
          </Animatable.View>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <View style={styles.accountInputContainer}>
              <View style={styles.accountPrefixContainer}>
                <Text style={styles.accountPrefixFlag}>{countryInfo.flag}</Text>
                <Text style={styles.accountPrefixCode}>{countryInfo.phoneCode}</Text>
              </View>
              <View style={styles.accountNumberInput}>
                <FontAwesome name="user-circle-o" size={20} color="#4a5568" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.mmtAccount && styles.inputError]}
                  placeholder="MMT Account Number"
                  placeholderTextColor="#a0aec0"
                  keyboardType="number-pad"
                  value={form.mmtAccount}
                  onChangeText={(text) => setForm({ ...form, mmtAccount: formatAccountNumber(text) })}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(1)}
                  blurOnSubmit={false}
                  ref={ref => inputs.current[0] = ref}
                />
              </View>
            </View>
            {errors.mmtAccount && <Text style={styles.errorText}>{errors.mmtAccount}</Text>}

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="First Name"
                  placeholderTextColor="#a0aec0"
                  value={form.firstName}
                  onChangeText={(text) => setForm({ ...form, firstName: text })}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(2)}
                  blurOnSubmit={false}
                  ref={ref => inputs.current[1] = ref}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Middle Name"
                  placeholderTextColor="#a0aec0"
                  value={form.middleName}
                  onChangeText={(text) => setForm({ ...form, middleName: text })}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(3)}
                  blurOnSubmit={false}
                  ref={ref => inputs.current[2] = ref}
                />
              </View>
            </View>
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={18} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor="#a0aec0"
                value={form.lastName}
                onChangeText={(text) => setForm({ ...form, lastName: text })}
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(4)}
                blurOnSubmit={false}
                ref={ref => inputs.current[3] = ref}
              />
            </View>
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="City"
                placeholderTextColor="#a0aec0"
                value={form.city}
                onChangeText={(text) => setForm({ ...form, city: text })}
                returnKeyType="next"
                onSubmitEditing={() => focusNextField(5)}
                blurOnSubmit={false}
                ref={ref => inputs.current[4] = ref}
              />
            </View>
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <View style={styles.phoneInputContainer}>
              <View style={styles.phonePrefixContainer}>
                <Text style={styles.phonePrefixFlag}>{countryInfo.flag}</Text>
                <Text style={styles.phonePrefixCode}>{countryInfo.phoneCode}</Text>
              </View>
              <View style={styles.phoneNumberInput}>
                <FontAwesome name="phone" size={20} color="#4a5568" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, errors.mobileNumber && styles.inputError]}
                  placeholder="7XX XXX XXX"
                  placeholderTextColor="#a0aec0"
                  keyboardType="phone-pad"
                  value={form.mobileNumber}
                  onChangeText={(text) => setForm({ ...form, mobileNumber: formatPhoneNumber(text) })}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(6)}
                  blurOnSubmit={false}
                  ref={ref => inputs.current[5] = ref}
                />
              </View>
            </View>
            {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

            <View style={styles.inputContainer}>
              <FontAwesome name="handshake-o" size={18} color="#4a5568" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Relationship (Optional)"
                placeholderTextColor="#a0aec0"
                value={form.relationship}
                onChangeText={(text) => setForm({ ...form, relationship: text })}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                ref={ref => inputs.current[6] = ref}
              />
            </View>
          </Animated.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={400}
            style={styles.warningContainer}
          >
            <MaterialIcons name="warning" size={20} color="#dd6b20" />
            <Text style={styles.warning}>
              Customers cannot send money to businesses{'\n'}
              <Text style={{ fontFamily: 'Roboto' }}>
                Macaamiishu lacag uma diri karaan shirkad
              </Text>
            </Text>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={600}
          >
            <TouchableOpacity 
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <FontAwesome name="save" size={18} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.submitText}>Save Recipient</Text>
                </>
              )}
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ... (keep all the existing styles from the previous code)

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748'
  },
  headerIcon: {
    width: 40,
    height: 40
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#ebf8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  note: {
    flex: 1,
    marginLeft: 10,
    color: '#2b6cb0',
    fontSize: 14,
    lineHeight: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  accountPrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginRight: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accountPrefixFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  accountPrefixCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  accountNumberInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  phonePrefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginRight: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  phonePrefixFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  phonePrefixCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  phoneNumberInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    height: 50,
    color: '#1a202c',
    fontSize: 14
  },
  inputError: {
    borderColor: '#e53e3e'
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 6
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 8
  },
  countryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12
  },
  countryLabel: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '600'
  },
  countrySubLabel: {
    fontSize: 14,
    color: '#718096'
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fffaf0',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#dd6b20'
  },
  warning: {
    flex: 1,
    marginLeft: 10,
    color: '#9c4221',
    fontSize: 14,
    lineHeight: 20
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3182ce',
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#3182ce',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#a0aec0'
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});