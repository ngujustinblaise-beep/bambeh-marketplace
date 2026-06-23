import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { db } from "@/utils/firebase/firebaseConfig";

interface UseFirebaseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFirebaseCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
): UseFirebaseCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(documents);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err as Error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error, refetch: fetchCollection };
}
