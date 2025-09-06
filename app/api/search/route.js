

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

/**
 * Handles the API request for searching lessons across all topics dynamically.
 *
 * This version fetches all lessons from each topic and filters in-memory
 * to provide a more flexible and reliable search, as the previous Firestore
 * `where` clause was too specific for general text search.
 *
 * @param {Request} request The incoming Next.js request object.
 * @returns {NextResponse} A JSON response containing all matching lessons.
 */
export async function POST(request) {
  try {
    const payload = await request.json();
    const { query: searchTerm } = payload || {};

    // --- 1. Validate the search term ---
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return NextResponse.json({ lessons: [] });
    }

    const searchLower = searchTerm.toLowerCase();

    // --- 2. Dynamically get all topics from the Firestore 'topics' collection ---
    const topicsCollectionRef = collection(db, 'topics');
    const topicsSnapshot = await getDocs(topicsCollectionRef);
    const topicsToSearch = topicsSnapshot.docs.map(doc => doc.id);
    
    if (topicsToSearch.length === 0) {
      console.warn("No topics found in the 'topics' collection.");
      return NextResponse.json({ lessons: [] });
    }

    let allLessons = [];

    // --- 3. Iterate through the dynamically fetched topics and query each one ---
    for (const topic of topicsToSearch) {
      const lessonsCollectionRef = collection(db, `topics/${topic}/lessons`);
      
      // Fetch all documents from the subcollection. This can be slow for large datasets.
      const lessonsSnapshot = await getDocs(lessonsCollectionRef);
      const lessons = lessonsSnapshot.docs.map(d => ({
        id: d.id,
        topic: topic, // Add the topic to the lesson data
        ...d.data()
      }));

      // Filter the lessons in memory based on the search term.
      const filteredLessons = lessons.filter(lesson => 
        lesson.title?.toLowerCase().includes(searchLower) ||
        lesson.description?.toLowerCase().includes(searchLower)
      );
      
      allLessons = allLessons.concat(filteredLessons);
    }
    
    return NextResponse.json({ lessons: allLessons });
    
  } catch (error) {
    console.error("Error in /api/search:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
