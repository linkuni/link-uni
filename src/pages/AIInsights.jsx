import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import toast from "react-hot-toast";
import { ChevronUp } from "lucide-react";

export default function AIInsights() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [summaryData, setSummaryData] = useState(null);
  const [examData, setExamData] = useState(null);
  const [pyqData, setPyqData] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [resourceType, setResourceType] = useState("notes");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    summary: null,
    examQuestions: null,
    pyqSolutions: null
  });

  useEffect(() => {
    const fetchAIInsightsData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${postId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch AI insights');
        }
        
        const postData = await response.json();
        
        // Set post title and resource type
        setPostTitle(postData.title || "AI Insights");
        setResourceType(postData.category.resourceType || "notes");
        
        // Set processing status
        setProcessingStatus(postData.processingStatus || {
          summary: null,
          examQuestions: null,
          pyqSolutions: null
        });
        
        // Set summary data if available
        if (postData.summary && postData.summary.length > 0) {
          setSummaryData(postData.summary[0]);
        }
        
        // Set exam data if available
        if (postData.exam) {
          setExamData(postData.exam);
        }
        
        // Set pyq data if available
        if (postData.pyq) {
          setPyqData(postData.pyq?.[0]);
        }

        // Set default active tab based on resource type
        if (postData.category.resourceType.toLowerCase() === "pyq") {
          setActiveTab("pyqSolutions");
        }
        
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load AI insights');
        setLoading(false);
        // Navigate back to dossier page if error occurs
        navigate(`/dossier?id=${postId}`);
      }
    };

    if (postId) {
      fetchAIInsightsData();
    }
    
    // Add scroll event listener for scroll-to-top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [postId, navigate]);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Dynamic tabs rendering based on resource type
  const renderTabs = () => {
    if (resourceType.toLowerCase() === "pyq") {
      return (
        <TabsList className="w-full">
          <TabsTrigger value="pyqSolutions">PYQ Solutions</TabsTrigger>
        </TabsList>
      );
    } else {
      return (
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="exam">Exam Prep</TabsTrigger>
        </TabsList>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">AI Insights: {postTitle}</h1>
        <Link to={`/dossier?id=${postId}`}>
          <Button variant="outline">Back to Document</Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
            <p className="text-blue-600 font-medium">Loading AI Insights...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg shadow-lg">
          <Tabs 
            defaultValue={resourceType.toLowerCase() === "pyq" ? "pyqSolutions" : "summary"}
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b">
              {renderTabs()}
            </div>
            
            <div className="p-6">
              <TabsContent value="summary" className="space-y-6 mt-0">
                {processingStatus?.summary === "processing" && (
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-center space-x-2 py-8">
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                      <p className="text-blue-600 font-medium">Processing summary...</p>
                    </div>
                  </div>
                )}
                
                {processingStatus?.summary === "failed" && (
                  <div className="p-4 border border-red-200 rounded-md">
                    <div className="flex items-center justify-center py-8">
                      <svg className="w-6 h-6 text-red-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-red-800 font-medium">Failed to process summary</p>
                    </div>
                  </div>
                )}
                
                {summaryData && processingStatus?.summary === "completed" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{summaryData.title || postTitle}</h3>
                    
                    {summaryData.overview && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-1">Overview</h4>
                        <p>{summaryData.overview}</p>
                      </div>
                    )}
                    
                    {summaryData.mainPoints && summaryData.mainPoints.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-500 mb-1">Main Points</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 list-disc pl-5">
                            {summaryData.mainPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                            </ul>
                        </div>
                        )}
                    
                    {summaryData.importantTerms && summaryData.importantTerms.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-1">Important Terms</h4>
                        <div className="flex flex-wrap gap-2">
                          {summaryData.importantTerms.map((term, index) => (
                            <span key={index} className="bg-blue-800 text-blue-200 px-3 py-1 rounded-full">{term}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {summaryData.benefits && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-1">Benefits</h4>
                        <p>{summaryData.benefits}</p>
                      </div>
                    )}
                    
                    {summaryData.riskOrLimitations && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-1">Risk or Limitations</h4>
                        <p>{summaryData.riskOrLimitations}</p>
                      </div>
                    )}
                    
                    {summaryData.recommendations && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-500 mb-1">Recommendations</h4>
                        <p>{summaryData.recommendations}</p>
                      </div>
                    )}
                    
                    {summaryData.conclusion && (
                      <div>
                        <h4 className="font-medium text-gray-500 mb-1">Conclusion</h4>
                        <p>{summaryData.conclusion}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="exam" className="space-y-6 mt-0">
                {processingStatus?.examQuestions === "processing" && (
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-center space-x-2 py-8">
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                      <p className="text-blue-600 font-medium">Processing exam questions...</p>
                    </div>
                  </div>
                )}
                
                {processingStatus?.examQuestions === "failed" && (
                  <div className="p-4 border border-red-200 rounded-md">
                    <div className="flex items-center justify-center py-8">
                      <svg className="w-6 h-6 text-red-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-red-800 font-medium">Failed to process exam questions</p>
                    </div>
                  </div>
                )}
                
                {examData && processingStatus?.examQuestions === "completed" && (
                  <div className="space-y-8">
                    {examData.map((exam, index) => (
                      <div key={index} className="p-6 border rounded-lg">
                        <div className="mb-4">
                          <h4 className="font-medium text-lg mb-2">Question {index + 1}</h4>
                          <p className="text-gray-300">{exam.question}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-lg mb-2">Answer</h4>
                          <p className="text-gray-300">{exam.answer}</p>
                        </div>
                        
                        {exam.keyPoints && exam.keyPoints.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-500 mb-1">Key Points</h4>
                            <ul className="list-disc pl-5">
                              {exam.keyPoints.map((point, index) => (
                                <li key={index} className="mb-1">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {exam.tips && exam.tips.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-500 mb-1">Tips</h4>
                            <ul className="list-disc pl-5">
                              {exam.tips.map((tip, index) => (
                                <li key={index} className="mb-1">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pyqSolutions" className="space-y-6 mt-0">
                {processingStatus?.pyqSolutions === "processing" && (
                  <div className="p-4 border rounded-md">
                    <div className="flex items-center justify-center space-x-2 py-8">
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                      <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                      <p className="text-blue-600 font-medium">Processing PYQ solutions...</p>
                    </div>
                  </div>
                )}
                
                {processingStatus?.pyqSolutions === "failed" && (
                  <div className="p-4 border border-red-200 rounded-md">
                    <div className="flex items-center justify-center py-8">
                      <svg className="w-6 h-6 text-red-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-red-800 font-medium">Failed to process PYQ solutions</p>
                    </div>
                  </div>
                )}
                
                {pyqData && processingStatus?.pyqSolutions === "completed" && (
                  <div className="space-y-4">
                    {pyqData.academicYear && (
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold">Academic Year: {pyqData.academicYear}</h3>
                      </div>
                    )}
                    
                    {pyqData.solutions && pyqData.solutions.length > 0 && (
                      <div className="space-y-8">
                        {pyqData.solutions.map((solution, index) => (
                          <div key={index} className="p-6 border rounded-lg">
                            <div className="mb-4">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-lg mb-2">
                                  Question {solution.questionNumber || index + 1}
                                  {solution.marks && <span className="ml-2 text-sm bg-blue-800 text-blue-200 px-2 py-1 rounded-full">{solution.marks} marks</span>}
                                </h4>
                              </div>
                              <p className="text-gray-300 mb-4">{solution.questionText}</p>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium text-lg mb-2">Solution</h4>
                              
                              {solution.solution?.introduction && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-500 mb-1">Introduction</h5>
                                  <p>{solution.solution.introduction}</p>
                                </div>
                              )}
                              
                              {solution.solution?.keyConcepts && solution.solution.keyConcepts.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-500 mb-1">Key Concepts</h5>
                                  <ul className="list-disc pl-5">
                                    {solution.solution.keyConcepts.map((concept, idx) => (
                                      <li key={idx} className="mb-1">{concept}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {solution.solution?.mainContent && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-500 mb-1">Answer</h5>
                                  <p className="whitespace-pre-line">{solution.solution.mainContent}</p>
                                </div>
                              )}
                              
                              {solution.solution?.examples && solution.solution.examples.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-500 mb-1">Examples</h5>
                                  <ul className="list-disc pl-5">
                                    {solution.solution.examples.map((example, idx) => (
                                      <li key={idx} className="mb-1">{example}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {solution.solution?.conclusion && (
                                <div className="mb-4">
                                  <h5 className="font-medium text-gray-500 mb-1">Conclusion</h5>
                                  <p>{solution.solution.conclusion}</p>
                                </div>
                              )}
                              
                              {solution.solution?.tips && solution.solution.tips.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-500 mb-1">Tips</h5>
                                  <ul className="list-disc pl-5">
                                    {solution.solution.tips.map((tip, idx) => (
                                      <li key={idx} className="mb-1">{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full h-12 w-12 shadow-lg p-0 bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
} 