import React, { useState } from 'react';
import SideBar from '../SideBar/SideBar';
import { 
    IconInbox, 
    IconArrowLeft, 
    IconCircle, 
    IconCircleFilled, 
    IconUser, 
    IconBell, 
    IconTrash, 
    IconShare, 
    IconArchive, 
    IconCornerUpLeft,
    IconCornerUpRight
} from '@tabler/icons-react';

// Mock inbox data
const mockMessages = [
  {
    id: 1,
    subject: "Welcome to ReactFlow Mindfuel Prototype",
    sender: "Mindfuel Team",
    preview: "Welcome to the ReactFlow prototype! This application demonstrates...",
    timestamp: "2 hours ago",
    isRead: false,
    content: `
      <h2>Welcome to the ReactFlow Mindfuel Prototype!</h2>
      
      <p>This application demonstrates a data lineage and relationship visualization tool built with React and ReactFlow. Here's what you can explore:</p>
      
      <h3>Key Features:</h3>
      <ul>
        <li><strong>Interactive Node Graph:</strong> Visualize relationships between Opportunities, Data Products, Data Assets, and Data Sources</li>
        <li><strong>Dynamic Filtering:</strong> Use the left panel to filter node types and search for specific items</li>
        <li><strong>Node Details:</strong> Click on any node to view detailed information in the side drawer</li>
        <li><strong>Smooth Animations:</strong> Experience GSAP-powered animations throughout the interface</li>
        <li><strong>Responsive Design:</strong> Works seamlessly across desktop and mobile devices</li>
      </ul>
      
      <h3>Important Caveats:</h3>
      <ul>
        <li>This is a <strong>prototype</strong> - not all features are fully implemented</li>
        <li>Data is currently mocked and not connected to a real backend</li>
        <li>Some interactions may be limited or non-functional</li>
        <li>Performance may vary depending on the number of nodes displayed</li>
      </ul>
      
      <p>Feel free to explore the interface and test the various features. Your feedback is valuable for improving the user experience!</p>
      
      <p><em>Happy exploring!</em><br/>
      The Mindfuel Development Team</p>
    `
  },
  {
    id: 2,
    subject: "System Update: New Features Available",
    sender: "System Notifications",
    preview: "We've added new features to improve your experience including...",
    timestamp: "1 day ago",
    isRead: true,
    content: `
      <h2>System Update: New Features Available</h2>
      
      <p>We're excited to announce several new features have been added to the prototype:</p>
      
      <h3>What's New:</h3>
      <ul>
        <li><strong>Enhanced Node Handles:</strong> Connection points now appear on hover with smooth animations</li>
        <li><strong>Improved Modal System:</strong> Create new items with our redesigned modal interface</li>
        <li><strong>Better Mobile Support:</strong> Optimized experience for mobile and tablet devices</li>
        <li><strong>Inbox System:</strong> This new messaging system to keep you updated</li>
      </ul>
      
      <h3>Coming Soon:</h3>
      <ul>
        <li>Real-time collaboration features</li>
        <li>Advanced filtering and search capabilities</li>
        <li>Export functionality for graphs and data</li>
        <li>Integration with external data sources</li>
      </ul>
      
      <p>Continue exploring to discover all the improvements we've made!</p>
    `
  }
];

const Inbox = ({ onNavigateBack }) => {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [messages, setMessages] = useState(mockMessages);

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    // Mark message as read
    if (!message.isRead) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, isRead: true } : msg
        )
      );
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp;
  };

  return (
    <div className="flex flex-row h-screen bg-slate-50">
      {/* Sidebar */}
      <SideBar 
        onOpenNewItemModal={() => {}} // No modal on inbox page
        onNavigateToInbox={() => {}} // Already on inbox page
        onNavigateToMain={onNavigateBack} // Use the same function as the back button
        isMainView={false} // Hide main view specific buttons
        currentView="inbox"
      />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-16 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-300 px-4 py-2 flex items-center gap-4 flex-shrink-0">
            <h3 className="text-md font-semibold text-slate-800 select-none">Inbox</h3>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Message List - Left Side */}
          <div className="w-full  max-w-[480px] bg-white border-r border-slate-200 flex flex-col items-start">
            <div className="p-4 border-b border-slate-200 flex items-start flex-col">
              <h3 className="text-lg font-medium text-slate-800 select-none">Messages</h3>
              <p className="text-sm text-slate-600 select-none">{messages.length} total</p>
            </div>
            
            <div className="flex-1 overflow-y-auto w-full">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageSelect(message)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors duration-200 hover:bg-slate-50 ${
                    selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {message.isRead ? (
                        <IconCircle className="w-3 h-3 text-slate-400" strokeWidth={2} />
                      ) : (
                        <IconCircleFilled className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 items-center align-middle">
                      <div className="flex items-center gap-2 mb-1 select-none">
                        <img 
                          src={message.sender === 'Mindfuel Team' ? '/avatars/Avatar5.png' : '/avatars/Avatar6.png'} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 select-none" 
                        />
                        <span className="text-sm font-medium text-slate-600 truncate items-start select-none">
                          {message.sender}
                        </span>
                      </div>
                      
                      <h4 className={`text-sm mb-1 truncate flex items-start text-left select-none ${
                        message.isRead ? 'text-slate-700' : 'text-slate-900 font-semibold'
                      }`}>
                        {message.subject}
                      </h4>
                      
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2 text-left flex items-start select-none">
                        {message.preview}
                      </p>
                      
                      <span className="flex items-start text-xs text-slate-400 select-none">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Message Preview - Right Side */}
          <div className="flex-1 bg-white flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-6 border-b border-slate-200 flex-shrink-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={selectedMessage.sender === 'Mindfuel Team' ? '/avatars/Avatar5.png' : '/avatars/Avatar6.png'} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-xl text-left font-semibold text-slate-800 mb-1">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span>From: {selectedMessage.sender}</span>
                        <span>{formatTimestamp(selectedMessage.timestamp)}</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-600 bg-slate-50  hover:bg-slate-200 rounded-md transition-colors duration-200"
                            onClick={() => console.log('Delete message:', selectedMessage.id)}
                          >
                          
                            Delete
                          </button>
                          
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 bg-slate-50  hover:bg-blue-50 rounded-md transition-colors duration-200"
                            onClick={() => console.log('Forward message:', selectedMessage.id)}
                          >
                            <IconCornerUpRight className="w-4 h-4" strokeWidth={2} />
                            Forward
                          </button>
                          
                          <button
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-600 bg-slate-50  hover:bg-slate-200 rounded-md transition-colors duration-200"
                            onClick={() => console.log('Archive message:', selectedMessage.id)}
                          >
                           
                            Archive
                          </button>
                        </div>
                        
                        <button
                          className="flex items-center gap-1 px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 font-medium"
                          onClick={() => console.log('Reply to message:', selectedMessage.id)}
                        >
                          <IconCornerUpLeft className="w-4 h-4" strokeWidth={2} />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Message Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div 
                    className="prose prose-slate max-w-none text-left max-w-[800px] ml-12"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.content }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <IconInbox className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Select a message</h3>
                  <p className="text-slate-500">Choose a message from the list to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox; 