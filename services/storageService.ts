import { Trip } from '../types';

const GIST_FILENAME = 'trip-data.json';

interface GistFile {
  content: string;
}

interface GistData {
  description: string;
  public: boolean;
  files: {
    [filename: string]: GistFile;
  };
}

interface GistResponse {
  id: string;
  files: {
    [filename: string]: GistFile & { filename: string; type: string; language: string; raw_url: string; size: number };
  };
  html_url: string;
  message?: string; // For errors
}

export const loadTripsFromGist = async (gistId: string): Promise<Trip[]> => {
  if (!gistId) {
    console.warn("No Gist ID provided for loading.");
    return [];
  }
  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Gist: ${response.status} ${errorData.message || response.statusText}`);
    }
    const gist: GistResponse = await response.json();
    const file = gist.files[GIST_FILENAME];
    if (file && file.content) {
      const parsedTrips = JSON.parse(file.content) as Trip[];
      // Ensure expenses, participants, and manualTransactions are arrays
      return parsedTrips.map(trip => ({
        ...trip,
        participants: trip.participants || [],
        expenses: trip.expenses || [],
        manualTransactions: trip.manualTransactions || [],
      }));
    } else {
      console.warn(`Gist ${gistId} does not contain the file ${GIST_FILENAME} or file is empty.`);
      return []; // Return empty if file not found or no content
    }
  } catch (error) {
    console.error("Failed to parse trips from Gist:", error);
    throw error; // Re-throw to be caught by caller
  }
};

export const saveTripsToGist = async (
  trips: Trip[],
  githubToken: string,
  gistIdToUpdate?: string
): Promise<{ id: string; html_url: string }> => {
  if (!githubToken) {
    throw new Error("GitHub token is required to save data to Gist.");
  }

  const gistData: GistData = {
    description: 'Trip Expense Splitter Data',
    public: true, // For "access anyone"
    files: {
      [GIST_FILENAME]: {
        content: JSON.stringify(trips, null, 2), // Pretty print JSON
      },
    },
  };

  const url = gistIdToUpdate ? `https://api.github.com/gists/${gistIdToUpdate}` : 'https://api.github.com/gists';
  const method = gistIdToUpdate ? 'PATCH' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gistData),
    });

    const responseData: GistResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to save Gist: ${response.status} ${responseData.message || response.statusText}`);
    }
    
    return { id: responseData.id, html_url: responseData.html_url };
  } catch (error) {
    console.error("Error saving trips to Gist:", error);
    throw error; // Re-throw to be caught by caller
  }
};
