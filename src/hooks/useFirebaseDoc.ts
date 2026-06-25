import { useState, useEffect } from "react";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/utils/firebase/firebaseConfig";

interface UseFirebaseDocResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFirebaseDoc<T = DocumentData>(
  collectionName: string,
  documentId: string | undefined,
): UseFirebaseDocResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDoc = async () => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        setData(null);
        setError(new Error("Document not found"));
      }
    } catch (err) {
      console.error(`Error fetching ${collectionName}/${documentId}:`, err);
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [collectionName, documentId]);

  return { data, loading, error, refetch: fetchDoc };
}

