import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';

import { colors, radius, shadows, spacing, typography } from '@/theme';
import { useStudent, useAddDocument, useDeleteDocument } from '@/modules/students/hooks';
import type { StudentsStackParamList } from '@/navigation/types';
import { api } from '@/services/api';

type RouteProps = RouteProp<StudentsStackParamList, 'StudentDocuments'>;
type NavigationProp = NativeStackNavigationProp<StudentsStackParamList>;

export default function StudentDocumentsScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { studentId } = route.params;

  const { data: student, isLoading: studentLoading } = useStudent(studentId);
  const addDocumentMutation = useAddDocument(studentId);
  const deleteDocumentMutation = useDeleteDocument(studentId);

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsUploading(true);
      const asset = result.assets[0];

      // Prepare FormData
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      } as any);
      formData.append('type', 'DOCUMENT');

      // Upload file to CMS Media Endpoint
      const uploadRes = await api.post('/cms/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadRes.data?.success) {
        throw new Error('Upload failed');
      }

      const documentUrl = uploadRes.data.data.url;

      // Select Document Type Dialog
      Alert.alert(
        'Document Type',
        'Please select the type of document',
        [
          { text: 'ID Proof', onPress: () => saveDocument(documentUrl, 'ID_PROOF', asset.name) },
          { text: 'Medical', onPress: () => saveDocument(documentUrl, 'MEDICAL_RECORD', asset.name) },
          { text: 'Admission', onPress: () => saveDocument(documentUrl, 'ADMISSION_FORM', asset.name) },
          { text: 'Certificate', onPress: () => saveDocument(documentUrl, 'CERTIFICATE', asset.name) },
          { text: 'Other', onPress: () => saveDocument(documentUrl, 'OTHER', asset.name) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );

    } catch (error: any) {
      Alert.alert('Upload Error', error?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const saveDocument = async (url: string, type: string, title: string) => {
    try {
      await addDocumentMutation.mutateAsync({
        documentUrl: url,
        documentType: type,
        title,
      });
      Alert.alert('Success', 'Document added successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save document record.');
    }
  };

  const handleDelete = (docId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocumentMutation.mutateAsync(docId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const openDocument = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open the document.');
    });
  };

  if (studentLoading || !student) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary600} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.slate700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.fullName}</Text>
          <Text style={styles.studentMeta}>{student.admissionNumber}</Text>
        </View>

        <TouchableOpacity 
          style={styles.uploadBtn} 
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={colors.primary600} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={24} color={colors.primary600} />
              <Text style={styles.uploadBtnText}>Upload New Document</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Uploaded Documents</Text>
          
          {student.documents && student.documents.filter(d => !d.deletedAt).length > 0 ? (
            student.documents.filter(d => !d.deletedAt).map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docIcon}>
                  <Ionicons name="document-text-outline" size={24} color={colors.primary600} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{doc.title || doc.documentType}</Text>
                  <Text style={styles.docType}>{doc.documentType.replace('_', ' ')}</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openDocument(doc.documentUrl)}>
                  <Ionicons name="eye-outline" size={20} color={colors.slate600} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(doc.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.red500} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.slate300} />
              <Text style={styles.emptyText}>No documents uploaded yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
  },
  loadingText: {
    ...typography.body,
    color: colors.slate400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading,
    color: colors.slate900,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing['2'],
  },
  scroll: {
    paddingHorizontal: spacing['4'],
    paddingBottom: spacing['10'],
    gap: spacing['6'],
  },
  studentInfo: {
    alignItems: 'center',
    paddingVertical: spacing['2'],
  },
  studentName: {
    ...typography.h3,
    color: colors.slate900,
  },
  studentMeta: {
    ...typography.small,
    color: colors.slate500,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary200,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    paddingVertical: spacing['6'],
  },
  uploadBtnText: {
    ...typography.bodyBold,
    color: colors.primary600,
  },
  list: {
    gap: spacing['3'],
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.slate900,
    marginBottom: spacing['2'],
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing['3'],
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    ...typography.smallBold,
    color: colors.slate900,
  },
  docType: {
    ...typography.xs,
    color: colors.slate500,
    marginTop: spacing['0.5'],
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['10'],
    gap: spacing['3'],
  },
  emptyText: {
    ...typography.body,
    color: colors.slate400,
  },
});
