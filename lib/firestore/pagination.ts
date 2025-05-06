import { collection, query, orderBy, startAfter, limit, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase-config/client';
import { COLLECTIONS } from '@/constants/collections';

export interface PaginationResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function getPaginatedCollection<T>(
  collectionName: string,
  {
    orderByField = 'createdAt',
    orderDirection = 'desc',
    pageSize = 10,
    startAfterDoc,
  }: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    pageSize?: number;
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  } = {}
): Promise<PaginationResult<T>> {
  const collectionRef = collection(db, collectionName);
  
  // Create query with one extra item to check if there are more pages
  let q = query(
    collectionRef,
    orderBy(orderByField, orderDirection),
    limit(pageSize + 1)
  );

  // If we have a starting point, start after it
  if (startAfterDoc) {
    q = query(
      collectionRef,
      orderBy(orderByField, orderDirection),
      startAfter(startAfterDoc),
      limit(pageSize + 1)
    );
  }

  const snapshot = await getDocs(q);
  const hasMore = snapshot.docs.length > pageSize;
  
  // Remove the extra item we used to check for more pages
  const docs = hasMore ? snapshot.docs.slice(0, -1) : snapshot.docs;
  
  return {
    items: docs.map(doc => ({ id: doc.id, ...doc.data() } as T)),
    lastDoc: docs[docs.length - 1] || null,
    hasMore
  };
} 