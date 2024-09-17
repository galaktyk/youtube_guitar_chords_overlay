function handleTabChange(activeInfo) {
    const tabId = activeInfo.tabId;
    
    // Get the tab details
    chrome.tabs.get(tabId, (tab) => {
      const tabUrl = tab.url;
      
      // Send the URL to the content script
      chrome.tabs.sendMessage(tabId, { type: 'TAB_URL', url: tabUrl });
    });
  }
  
  // Listen for tab activation changes
  chrome.tabs.onActivated.addListener(handleTabChange);