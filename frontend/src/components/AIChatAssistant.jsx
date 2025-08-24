import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaUser, FaPaperPlane, FaMicrophone, FaFileAlt, FaChartLine, FaRoute, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// AI Chat Assistant Component
const AIChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  // Predefined quick actions
  const quickActions = [
    {
      icon: <FaRoute className="text-blue-500" />,
      text: 'Optimize Route',
      action: 'Can you help me optimize my delivery route for today?'
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      text: 'Analytics Report',
      action: 'Show me the latest analytics report for our fleet performance.'
    },
    {
      icon: <FaExclamationTriangle className="text-orange-500" />,
      text: 'Maintenance Alert',
      action: 'Are there any maintenance alerts for our vehicles?'
    },
    {
      icon: <FaFileAlt className="text-purple-500" />,
      text: 'Generate Report',
      action: 'Generate a monthly logistics report for January 2024.'
    }
  ];

  // AI responses based on keywords
  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Route optimization
    if (lowerMessage.includes('route') || lowerMessage.includes('optimize') || lowerMessage.includes('delivery')) {
      return {
        text: "I've analyzed your delivery route and found several optimization opportunities:\n\n" +
              "🚗 **Route Optimization Results:**\n" +
              "• Distance reduced by 18.4% (from 45km to 36.7km)\n" +
              "• Time saved: 23 minutes\n" +
              "• Fuel savings: 12.3 liters\n" +
              "• Carbon footprint reduced by 15.2%\n\n" +
              "**AI Recommendations:**\n" +
              "• Avoid city center during rush hour (8-10 AM, 4-6 PM)\n" +
              "• Use A2 highway for better fuel efficiency\n" +
              "• Optimize delivery sequence based on customer availability\n" +
              "• Consider weather conditions for route planning\n\n" +
              "Would you like me to apply these optimizations to your route?",
        type: 'ai',
        timestamp: new Date(),
        suggestions: ['Apply optimizations', 'View detailed analysis', 'Compare with alternatives']
      };
    }
    
    // Analytics and reports
    if (lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('performance')) {
      return {
        text: "Here's your latest fleet analytics report:\n\n" +
              "📊 **Fleet Performance Summary:**\n" +
              "• **Active Vehicles:** 12/15 (80% utilization)\n" +
              "• **Average Delivery Time:** 32 minutes (↓ 15% from last month)\n" +
              "• **Fuel Efficiency:** 8.2 L/100km (↑ 12% improvement)\n" +
              "• **Customer Satisfaction:** 4.7/5.0 (↑ 0.3 points)\n" +
              "• **Safety Score:** 94/100 (excellent)\n\n" +
              "**Key Insights:**\n" +
              "• Route optimization saved $2,450 this month\n" +
              "• Driver training improved safety by 18%\n" +
              "• Predictive maintenance prevented 3 breakdowns\n\n" +
              "Would you like a detailed breakdown of any specific metric?",
        type: 'ai',
        timestamp: new Date(),
        suggestions: ['View detailed metrics', 'Export report', 'Compare periods']
      };
    }
    
    // Maintenance alerts
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('alert') || lowerMessage.includes('vehicle')) {
      return {
        text: "🔧 **Maintenance Alerts & Recommendations:**\n\n" +
              "**Urgent (Next 7 days):**\n" +
              "• Vehicle WA-12345: Brake pad replacement due\n" +
              "• Vehicle WA-67890: Oil change required\n\n" +
              "**Scheduled (Next 30 days):**\n" +
              "• Vehicle WA-11111: Tire rotation\n" +
              "• Vehicle WA-22222: Air filter replacement\n\n" +
              "**AI Predictions:**\n" +
              "• 2 vehicles may need engine diagnostics within 2 weeks\n" +
              "• 1 vehicle showing signs of transmission issues\n\n" +
              "**Cost Impact:**\n" +
              "• Preventive maintenance: $1,200\n" +
              "• Potential breakdown costs avoided: $8,500\n\n" +
              "Would you like me to schedule these maintenance appointments?",
        type: 'ai',
        timestamp: new Date(),
        suggestions: ['Schedule maintenance', 'View vehicle details', 'Cost analysis']
      };
    }
    
    // General logistics questions
    if (lowerMessage.includes('logistics') || lowerMessage.includes('fleet') || lowerMessage.includes('delivery')) {
      return {
        text: "I'm here to help with all your logistics needs! Here's what I can assist you with:\n\n" +
              "🤖 **AI-Powered Features:**\n" +
              "• **Route Optimization:** Real-time route planning with traffic and weather consideration\n" +
              "• **Predictive Analytics:** Forecast maintenance needs and optimize operations\n" +
              "• **Cost Analysis:** Identify savings opportunities and ROI calculations\n" +
              "• **Safety Monitoring:** Driver behavior analysis and risk assessment\n" +
              "• **Performance Reports:** Comprehensive analytics and insights\n\n" +
              "**Quick Actions:**\n" +
              "• Generate reports\n" +
              "• Optimize routes\n" +
              "• Check maintenance status\n" +
              "• Analyze costs\n\n" +
              "What specific aspect of your logistics operations would you like to explore?",
        type: 'ai',
        timestamp: new Date(),
        suggestions: ['Route optimization', 'Analytics report', 'Maintenance check', 'Cost analysis']
      };
    }
    
    // Default response
    return {
      text: "I'm your AI logistics assistant! I can help you with:\n\n" +
            "• Route optimization and planning\n" +
            "• Fleet performance analytics\n" +
            "• Maintenance scheduling and alerts\n" +
            "• Cost analysis and optimization\n" +
            "• Safety monitoring and reporting\n" +
            "• Generating custom reports\n\n" +
            "Just ask me anything about your logistics operations, or use the quick action buttons above!",
      type: 'ai',
      timestamp: new Date(),
      suggestions: ['Route optimization', 'Analytics report', 'Maintenance alert', 'Generate report']
    };
  };

  // Handle sending message
  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = getAIResponse(message);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  // Handle quick action
  const handleQuickAction = (action) => {
    setInputMessage(action);
    handleSendMessage(action);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      text: "Hello! I'm your AI Logistics Assistant. I can help you optimize routes, analyze performance, manage maintenance, and much more. How can I assist you today?",
      type: 'ai',
      timestamp: new Date(),
      suggestions: ['Route optimization', 'Analytics report', 'Maintenance alert', 'Generate report']
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <FaRobot className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Logistics Assistant</h2>
            <p className="text-sm text-gray-600">Powered by machine learning</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center space-x-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              {action.icon}
              <span className="text-gray-700">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}>
                {message.type === 'user' ? (
                  <FaUser className="text-white text-sm" />
                ) : (
                  <FaRobot className="text-gray-600 text-sm" />
                )}
              </div>
              
              <div className={`rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}>
                <div className={`whitespace-pre-line text-sm ${
                  message.type === 'user' ? 'text-white' : 'text-gray-900'
                }`}>
                  {message.text}
                </div>
                
                {/* Suggestions */}
                {message.type === 'ai' && message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <FaRobot className="text-gray-600 text-sm" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about logistics..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />
          </div>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane className="text-sm" />
          </button>
          
          <button
            onClick={() => {
              setIsListening(!isListening);
              toast.success(isListening ? 'Voice input stopped' : 'Voice input started');
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <FaMicrophone className="text-sm" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          AI Assistant • Powered by machine learning • Real-time responses
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;

