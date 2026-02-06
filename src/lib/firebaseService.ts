import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

import { auth, db, storage } from "./firebase";

/* ==================== AUTH ==================== */

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: "owner" | "seeker";
}

export const registerUser = async (data: RegisterData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await updateProfile(userCredential.user, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      userType: data.userType,
      createdAt: Timestamp.now(),
      verified: false,
    });

    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const u = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: u.user };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

/* ==================== PROPERTIES ==================== */

export interface PropertyData {
  title: string;
  price: number;
  location: string;
  fullAddress: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  description: string;
  amenities?: string[];
  yearBuilt?: number;
  available?: string;
  ownerId: string;
  ownerName: string;
  images: string[];
  status: "active" | "rented" | "draft";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addProperty = async (
  propertyData: Omit<PropertyData, "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "properties"), {
      ...propertyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { success: true, id: docRef.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const getProperties = async (filters?: any) => {
  try {
    const snapshot = await getDocs(collection(db, "properties"));

    let properties = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as any
    );

    if (filters?.type)
      properties = properties.filter(
        (p) => p.type?.toLowerCase() === filters.type.toLowerCase()
      );

    if (filters?.minPrice !== undefined)
      properties = properties.filter((p) => p.price >= filters.minPrice);

    if (filters?.maxPrice !== undefined)
      properties = properties.filter((p) => p.price <= filters.maxPrice);

    if (filters?.bedrooms)
      properties = properties.filter((p) => p.bedrooms === filters.bedrooms);

    if (filters?.city)
      properties = properties.filter((p) =>
        p.location?.toLowerCase().includes(filters.city.toLowerCase())
      );

    if (filters?.availableOnly)
      properties = properties.filter((p) => p.status === "active");

    properties.sort((a, b) => {
      const aT = a.createdAt?.seconds || 0;
      const bT = b.createdAt?.seconds || 0;
      return bT - aT;
    });

    return { success: true, properties };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const getPropertyById = async (id: string) => {
  try {
    const refDoc = doc(db, "properties", id);
    const snap = await getDoc(refDoc);

    if (!snap.exists()) {
      return { success: false, error: "Property not found" };
    }

    return { success: true, property: { id: snap.id, ...snap.data() } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const updateProperty = async (
  id: string,
  updates: Partial<PropertyData>
) => {
  try {
    await updateDoc(doc(db, "properties", id), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const deleteProperty = async (id: string) => {
  try {
    await deleteDoc(doc(db, "properties", id));
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const getUserProperties = async (userId: string) => {
  try {
    const q = query(
      collection(db, "properties"),
      where("ownerId", "==", userId)
    );
    const snap = await getDocs(q);

    let properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

    properties.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    return { success: true, properties };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

/* ==================== IMAGE UPLOAD ==================== */

export const uploadPropertyImage = async (
  file: File,
  propertyId: string,
  index: number
) => {
  try {
    const path = `properties/${propertyId}/image_${index}_${Date.now()}`;
    const r = ref(storage, path);

    await uploadBytes(r, file);
    const url = await getDownloadURL(r);

    return { success: true, url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const uploadMultipleImages = async (files: File[], propertyId: string) => {
  try {
    const promises = files.map((f, i) =>
      uploadPropertyImage(f, propertyId, i)
    );

    const results = await Promise.all(promises);
    return {
      success: true,
      urls: results.filter((r) => r.success).map((r) => r.url),
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export { auth, db, storage };