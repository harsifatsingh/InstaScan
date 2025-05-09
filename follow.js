// Enhanced follow.js with improved functionality
// ——— UI hooks ———
const fileInput = document.getElementById('file-input');
const filenameDiv = document.getElementById('filename');
const processBtn = document.getElementById('process-btn');
const resultDiv = document.getElementById('results');
const loaderDiv = document.getElementById('loader');

// Enable/disable process button based on file selection
fileInput.addEventListener('change', () => {
  const fileName = fileInput.files[0]?.name || 'No file chosen';
  filenameDiv.textContent = fileName;
  processBtn.disabled = !fileInput.files.length;
  
  if (fileInput.files.length) {
    filenameDiv.innerHTML = `<i class="fas fa-file-archive"></i> ${fileName}`;
  } else {
    filenameDiv.innerHTML = 'No file chosen';
  }
});

processBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    showAlert('Please select your Instagram data ZIP file first.', 'error');
    return;
  }

  // Show loading state
  processBtn.disabled = true;
  loaderDiv.style.display = 'block';
  resultDiv.innerHTML = '';

  try {
    const zip = await JSZip.loadAsync(fileInput.files[0]);
    const allFiles = Object.keys(zip.files);

    // — Find the right JSON files —
    // First look for followers in multiple possible locations
    const followersPatterns = [
      /^followers(?:_\d+)?\.json$/i,
      /followers_and_following\/followers(?:_\d+)?\.json$/i,
      /followers_and_following\/followers\/followers(?:_\d+)?\.json$/i,
      /connections\/followers(?:_\d+)?\.json$/i
    ];

    let followersPath;
    for (const pattern of followersPatterns) {
      followersPath = allFiles.find(f => pattern.test(f.split('/').pop()));
      if (followersPath) break;
    }

    // Look for following file in multiple possible locations
    const followingPatterns = [
      /^following\.json$/i,
      /followers_and_following\/following\.json$/i,
      /following\/following\.json$/i,
      /connections\/following\.json$/i
    ];

    let followingPath;
    for (const pattern of followingPatterns) {
      followingPath = allFiles.find(f => pattern.test(f.split('/').pop()));
      if (followingPath) break;
    }

    if (!followersPath || !followingPath) {
      throw new Error(`Could not locate the followers or following JSON files in the ZIP. 
      Make sure you're uploading the correct Instagram data export.`);
    }

    // — Load & normalize followers pages —
    const rawFollowers = JSON.parse(
      await zip.file(followersPath).async('string')
    );
    
    let followerPages = [];
    if (Array.isArray(rawFollowers)) {
      // e.g. your followers_1.json is already a list of pages
      followerPages = rawFollowers;
    } else if (rawFollowers.relationships_followers && Array.isArray(rawFollowers.relationships_followers)) {
      followerPages = rawFollowers.relationships_followers;
    } else {
      // Try to locate data in different structures
      const possiblePaths = [
        'followers', 
        'relationships_followers', 
        'data.followers',
        'data.relationships_followers'
      ];
      
      for (const path of possiblePaths) {
        const data = getNestedData(rawFollowers, path);
        if (data && Array.isArray(data)) {
          followerPages = data;
          break;
        }
      }
      
      if (!followerPages.length) {
        throw new Error('Unexpected format in followers JSON. Could not parse your followers data.');
      }
    }

    const followersList = extractUsernamesFromPages(followerPages);

    // — Load & normalize following pages —
    const rawFollowing = JSON.parse(
      await zip.file(followingPath).async('string')
    );
    
    let followingPages = [];
    
    if (Array.isArray(rawFollowing)) {
      followingPages = rawFollowing;
    } else if (rawFollowing.relationships_following && Array.isArray(rawFollowing.relationships_following)) {
      followingPages = rawFollowing.relationships_following;
    } else {
      // Try to locate data in different structures
      const possiblePaths = [
        'following', 
        'relationships_following', 
        'data.following',
        'data.relationships_following'
      ];
      
      for (const path of possiblePaths) {
        const data = getNestedData(rawFollowing, path);
        if (data && Array.isArray(data)) {
          followingPages = data;
          break;
        }
      }
      
      if (!followingPages.length) {
        throw new Error('Unexpected format in following JSON. Could not parse your following data.');
      }
    }
    
    const followingList = extractUsernamesFromPages(followingPages);

    // — Compute "not following you back" —
    const followerSet = new Set(followersList);
    const followingSet = new Set(followingList);
    
    const notFollowingBack = followingList.filter(u => !followerSet.has(u));
    const youDontFollowBack = followersList.filter(u => !followingSet.has(u));

    // Sort alphabetically for better user experience
    notFollowingBack.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    youDontFollowBack.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // — Render beautiful results —
    resultDiv.innerHTML = `
      <h2>Analysis Results</h2>
      
      <div class="stats-container">
        <div class="stat">
          <div class="stat-value">${followersList.length}</div>
          <div class="stat-label">Followers</div>
        </div>
        
        <div class="stat">
          <div class="stat-value">${followingList.length}</div>
          <div class="stat-label">Following</div>
        </div>
        
        <div class="stat">
          <div class="stat-value">${notFollowingBack.length}</div>
          <div class="stat-label">Not Following You Back</div>
        </div>
      </div>
      
      <div class="stat-box">
        <h3><i class="fas fa-user-times"></i> Accounts not following you back (${notFollowingBack.length})</h3>
        <p>These accounts you follow, but they don't follow you back:</p>
        
        ${notFollowingBack.length > 0 ? `
          <ul class="unfollowers-list">
            ${notFollowingBack.map(u => `
              <li>
                <i class="fab fa-instagram insta-icon"></i>
                <a href="https://www.instagram.com/${u}" target="_blank">${u}</a>
              </li>
            `).join('')}
          </ul>
          <button class="export-btn" onclick="exportToCSV('not_following_back.csv', ${JSON.stringify(notFollowingBack)})">
            <i class="fas fa-download"></i> Export to CSV
          </button>
        ` : '<p>Everyone you follow is following you back. Nice!</p>'}
      </div>
      
      ${youDontFollowBack.length > 0 ? `
        <div class="stat-box">
          <h3><i class="fas fa-user-check"></i> You don't follow back (${youDontFollowBack.length})</h3>
          <p>These accounts follow you, but you don't follow them back:</p>
          
          <ul class="unfollowers-list">
            ${youDontFollowBack.map(u => `
              <li>
                <i class="fab fa-instagram insta-icon"></i>
                <a href="https://www.instagram.com/${u}" target="_blank">${u}</a>
              </li>
            `).join('')}
          </ul>
          <button class="export-btn" onclick="exportToCSV('you_dont_follow_back.csv', ${JSON.stringify(youDontFollowBack)})">
            <i class="fas fa-download"></i> Export to CSV
          </button>
        </div>
      ` : ''}
    `;
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth' });
    
  } catch (err) {
    console.error(err);
    showAlert(err.message, 'error');
  } finally {
    // Hide loading state
    processBtn.disabled = false;
    loaderDiv.style.display = 'none';
  }
});

// Helper function to extract usernames from pages with different formats
function extractUsernamesFromPages(pages) {
  const usernames = [];
  
  pages.forEach(page => {
    // Format 1: Array of string_list_data
    if (Array.isArray(page.string_list_data)) {
      page.string_list_data.forEach(item => {
        if (item.value) usernames.push(item.value);
      });
    } 
    // Format 2: Object with string_list_data
    else if (page.string_list_data && page.string_list_data.value) {
      usernames.push(page.string_list_data.value);
    }
    // Format 3: Direct username
    else if (page.username) {
      usernames.push(page.username);
    }
    // Format 4: Value property
    else if (page.value) {
      usernames.push(page.value);
    }
  });
  
  return usernames;
}

// Helper function to get nested data safely
function getNestedData(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

// Show styled alerts
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = type === 'error' ? 'warning' : 'note';
  alertDiv.innerHTML = `<strong>${type === 'error' ? 'Error' : 'Info'}:</strong> ${message}`;
  
  resultDiv.innerHTML = '';
  resultDiv.appendChild(alertDiv);
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Export data to CSV
function exportToCSV(filename, data) {
  const csvContent = "data:text/csv;charset=utf-8,Username\n" + data.join('\n');
  const encodedUri = encodeURI(csvContent);
  
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}