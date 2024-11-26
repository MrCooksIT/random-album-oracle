// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'albums'),
            (snapshot) => {
                setAlbums(snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
                setLoading(false);
            },
            (error) => {
                console.error('Firestore error:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { albums, loading };
};