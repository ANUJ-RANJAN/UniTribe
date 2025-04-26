import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Utility class to add sample data to the Firebase database
 * This is useful for testing and demonstration purposes
 */
class SampleDataUtility {
  /**
   * Add sample users to the database
   * @returns {Promise<string[]>} Array of created user IDs
   */
  static async addSampleUsers() {
    const batch = writeBatch(db);
    const userIds = [];

    const sampleUsers = [
      {
        uid: "sample-user-1",
        displayName: "Alex Johnson",
        email: "alex@example.com",
        photoURL: "https://api.dicebear.com/6.x/personas/svg?seed=alex",
      },
      {
        uid: "sample-user-2",
        displayName: "Sam Wilson",
        email: "sam@example.com",
        photoURL: "https://api.dicebear.com/6.x/personas/svg?seed=sam",
      },
      {
        uid: "sample-user-3",
        displayName: "Taylor Smith",
        email: "taylor@example.com",
        photoURL: "https://api.dicebear.com/6.x/personas/svg?seed=taylor",
      },
      {
        uid: "sample-user-4",
        displayName: "Jordan Lee",
        email: "jordan@example.com",
        photoURL: "https://api.dicebear.com/6.x/personas/svg?seed=jordan",
      },
      {
        uid: "sample-user-5",
        displayName: "Casey Brown",
        email: "casey@example.com",
        photoURL: "https://api.dicebear.com/6.x/personas/svg?seed=casey",
      },
    ];

    for (const user of sampleUsers) {
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, {
        ...user,
        createdAt: serverTimestamp(),
      });
      userIds.push(user.uid);
    }

    await batch.commit();
    console.log("Added sample users to database");
    return userIds;
  }

  /**
   * Add sample trips to the database
   * @param {string[]} userIds Array of user IDs to use as creators
   * @returns {Promise<string[]>} Array of created trip IDs
   */
  static async addSampleTrips(userIds = []) {
    if (!userIds.length) {
      userIds = await this.addSampleUsers();
    }

    const tripIds = [];
    const sampleTrips = [
      {
        title: "Weekend Trip to San Francisco",
        description:
          "Join us for a fun weekend exploring San Francisco! We'll visit the Golden Gate Bridge, Fisherman's Wharf, and more.",
        location: "San Francisco, CA",
        startDate: new Date("2025-05-15"),
        endDate: new Date("2025-05-17"),
        cost: 250,
        capacity: 8,
        imageUrl:
          "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
        createdBy: userIds[0],
        participants: [userIds[0], userIds[1]],
      },
      {
        title: "Spring Break in Miami",
        description:
          "Let's spend spring break on the beaches of Miami! We'll enjoy the sun, sand, and nightlife.",
        location: "Miami, FL",
        startDate: new Date("2025-03-10"),
        endDate: new Date("2025-03-17"),
        cost: 800,
        capacity: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1535498730771-e735b998cd64",
        createdBy: userIds[1],
        participants: [userIds[1], userIds[2], userIds[3]],
      },
      {
        title: "Hiking Trip to Yosemite",
        description:
          "A week of hiking and camping in Yosemite National Park. Experience the beauty of nature!",
        location: "Yosemite National Park, CA",
        startDate: new Date("2025-06-20"),
        endDate: new Date("2025-06-26"),
        cost: 350,
        capacity: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1472396961693-142e6e269027",
        createdBy: userIds[2],
        participants: [userIds[2], userIds[4]],
      },
      {
        title: "New York City Adventure",
        description:
          "Explore the Big Apple! We'll visit Times Square, Central Park, the Statue of Liberty, and more.",
        location: "New York, NY",
        startDate: new Date("2025-07-05"),
        endDate: new Date("2025-07-10"),
        cost: 900,
        capacity: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
        createdBy: userIds[3],
        participants: [userIds[3], userIds[0]],
      },
      {
        title: "Road Trip to Grand Canyon",
        description:
          "A road trip to see one of the natural wonders of the world. We'll drive from Phoenix and spend 3 days exploring.",
        location: "Grand Canyon, AZ",
        startDate: new Date("2025-08-15"),
        endDate: new Date("2025-08-19"),
        cost: 400,
        capacity: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722",
        createdBy: userIds[4],
        participants: [userIds[4], userIds[1], userIds[2]],
      },
    ];

    for (const trip of sampleTrips) {
      const docRef = await addDoc(collection(db, "trips"), {
        ...trip,
        createdAt: serverTimestamp(),
      });
      tripIds.push(docRef.id);
    }

    console.log("Added sample trips to database");
    return tripIds;
  }

  /**
   * Add sample events to the database
   * @param {string[]} userIds Array of user IDs to use as creators
   * @returns {Promise<string[]>} Array of created event IDs
   */
  static async addSampleEvents(userIds = []) {
    if (!userIds.length) {
      userIds = await this.addSampleUsers();
    }

    const eventIds = [];
    const sampleEvents = [
      {
        title: "Campus Movie Night",
        description:
          "Join us for a movie night on the quad! We'll be screening a popular movie and providing snacks.",
        location: "University Quad",
        date: new Date("2025-05-10T19:00:00"),
        cost: 0,
        capacity: 100,
        imageUrl:
          "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c",
        createdBy: userIds[0],
        attendees: [userIds[0], userIds[1], userIds[2]],
      },
      {
        title: "Local Art Gallery Opening",
        description:
          "Opening night for the new student art exhibition. Come support your fellow students and enjoy refreshments.",
        location: "Student Union Gallery",
        date: new Date("2025-04-15T18:00:00"),
        cost: 5,
        capacity: 50,
        imageUrl:
          "https://images.unsplash.com/photo-1531058020387-3be344556be6",
        createdBy: userIds[1],
        attendees: [userIds[1], userIds[3]],
      },
      {
        title: "Outdoor Yoga Session",
        description:
          "Start your day with a calming yoga session in the park. All skill levels welcome!",
        location: "City Park",
        date: new Date("2025-05-20T08:00:00"),
        cost: 10,
        capacity: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b",
        createdBy: userIds[2],
        attendees: [userIds[2], userIds[4]],
      },
      {
        title: "Campus Music Festival",
        description:
          "Annual music festival featuring student bands and local artists. Food trucks and activities all day!",
        location: "University Amphitheater",
        date: new Date("2025-06-05T12:00:00"),
        cost: 15,
        capacity: 500,
        imageUrl:
          "https://images.unsplash.com/photo-1501612780327-45045538702b",
        createdBy: userIds[3],
        attendees: [userIds[0], userIds[1], userIds[2], userIds[3], userIds[4]],
      },
      {
        title: "Tech Startup Networking",
        description:
          "Connect with local tech entrepreneurs and learn about startup opportunities. Resume workshop included.",
        location: "Business School Auditorium",
        date: new Date("2025-04-25T17:30:00"),
        cost: 0,
        capacity: 75,
        imageUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
        createdBy: userIds[4],
        attendees: [userIds[3], userIds[4]],
      },
    ];

    for (const event of sampleEvents) {
      const docRef = await addDoc(collection(db, "events"), {
        ...event,
        createdAt: serverTimestamp(),
      });
      eventIds.push(docRef.id);
    }

    console.log("Added sample events to database");
    return eventIds;
  }

  /**
   * Add sample communities to the database
   * @param {string[]} userIds Array of user IDs to use as creators
   * @returns {Promise<string[]>} Array of created community IDs
   */
  static async addSampleCommunities(userIds = []) {
    if (!userIds.length) {
      userIds = await this.addSampleUsers();
    }

    const communityIds = [];
    const sampleCommunities = [
      {
        name: "Adventure Seekers",
        description:
          "A community for students who love outdoor adventures, hiking, camping, and exploring nature.",
        category: "Outdoors",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306",
        createdBy: userIds[0],
        members: [userIds[0], userIds[2], userIds[4]],
      },
      {
        name: "International Students Club",
        description:
          "A welcoming community for international students to connect, share experiences, and explore together.",
        category: "Cultural",
        imageUrl:
          "https://images.unsplash.com/photo-1526735592105-218505891e2e",
        createdBy: userIds[1],
        members: [userIds[1], userIds[3]],
      },
      {
        name: "Tech Enthusiasts",
        description:
          "For students passionate about technology, coding, AI, and all things tech. Regular hackathons and workshops.",
        category: "Technology",
        imageUrl:
          "https://images.unsplash.com/photo-1581092921461-7559ec6de34f",
        createdBy: userIds[2],
        members: [userIds[0], userIds[2]],
      },
      {
        name: "Musicians Network",
        description:
          "Connect with fellow student musicians, form bands, find performance opportunities, and share your music.",
        category: "Arts",
        imageUrl:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
        createdBy: userIds[3],
        members: [userIds[1], userIds[3]],
      },
      {
        name: "Foodie Friends",
        description:
          "Explore local restaurants, organize food trips, share recipes, and bond over great food.",
        category: "Food",
        imageUrl:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
        createdBy: userIds[4],
        members: [userIds[2], userIds[4]],
      },
    ];

    for (const community of sampleCommunities) {
      const docRef = await addDoc(collection(db, "communities"), {
        ...community,
        createdAt: serverTimestamp(),
      });
      communityIds.push(docRef.id);
    }

    console.log("Added sample communities to database");
    return communityIds;
  }

  /**
   * Add sample chat messages to existing chatrooms
   * @param {string[]} userIds Array of user IDs to use as message senders
   * @returns {Promise<void>}
   */
  static async addSampleChatMessages(userIds = []) {
    if (!userIds.length) {
      userIds = await this.addSampleUsers();
    }

    const chatrooms = ["general", "travel", "events", "study"];

    // Create the chatrooms if they don't exist
    for (const room of chatrooms) {
      // We add a welcome message to ensure the room exists
      await addDoc(collection(db, `chatrooms/${room}/messages`), {
        text: `Welcome to the ${room} chatroom!`,
        createdAt: serverTimestamp(),
        uid: "system",
        displayName: "System",
        photoURL: "https://api.dicebear.com/6.x/bottts/svg?seed=system",
      });
    }

    const sampleMessages = [
      "Hey everyone! How's it going?",
      "Has anyone been to Europe recently? Looking for travel tips.",
      "I'm organizing a study group for final exams. Anyone interested?",
      "Just got back from an amazing trip to Colorado!",
      "Does anyone know if the library is open late today?",
      "I found a great cafe near campus, amazing study spot!",
      "Who's going to the campus concert next week?",
      "Looking for recommendations for a weekend getaway.",
      "Just joined this platform, looks awesome!",
      "Happy Friday everyone!",
    ];

    // Add sample messages to each chatroom
    for (const room of chatrooms) {
      for (let i = 0; i < 10; i++) {
        const randomUserIndex = Math.floor(Math.random() * userIds.length);
        const userId = userIds[randomUserIndex];

        // Get the user data
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data() || {
          displayName: "Anonymous User",
          photoURL: `https://api.dicebear.com/6.x/personas/svg?seed=${userId}`,
        };

        // Random message with a random timestamp in the past week
        const randomMessageIndex = Math.floor(
          Math.random() * sampleMessages.length
        );
        const message = sampleMessages[randomMessageIndex];

        const randomTime = new Date();
        randomTime.setDate(
          randomTime.getDate() - Math.floor(Math.random() * 7)
        );

        await addDoc(collection(db, `chatrooms/${room}/messages`), {
          text: message,
          createdAt: randomTime,
          uid: userId,
          displayName: userData.displayName || "Anonymous",
          photoURL:
            userData.photoURL ||
            `https://api.dicebear.com/6.x/personas/svg?seed=${userId}`,
        });
      }
    }

    console.log("Added sample chat messages to database");
  }

  /**
   * Add all sample data to the database
   * @returns {Promise<void>}
   */
  static async addAllSampleData() {
    console.log("Adding sample data to database...");

    const userIds = await this.addSampleUsers();
    await Promise.all([
      this.addSampleTrips(userIds),
      this.addSampleEvents(userIds),
      this.addSampleCommunities(userIds),
      this.addSampleChatMessages(userIds),
    ]);

    console.log("All sample data has been added to the database!");
  }
}

// Export both the class and individual methods for convenience
export const addSampleUsers = SampleDataUtility.addSampleUsers;
export const addSampleTrips = SampleDataUtility.addSampleTrips;
export const addSampleEvents = SampleDataUtility.addSampleEvents;
export const addSampleCommunities = SampleDataUtility.addSampleCommunities;
export const addSampleChatMessages = SampleDataUtility.addSampleChatMessages;
export const addAllSampleData = SampleDataUtility.addAllSampleData;

// Export the SampleDataUtility class
export { SampleDataUtility };
