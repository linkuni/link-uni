import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { StarIcon, Bookmark,FilePenLine, EyeIcon, FileIcon, FolderIcon } from "lucide-react"
import { useSelector } from "react-redux"
import UserCard from "../components/UserCard"
import download from "downloadjs";
import { formatDistanceToNow, set } from "date-fns"
import toast from "react-hot-toast"
import { updateStart, updateSuccess, updateFailure } from "../redux/user/userSlice"
import { updatePostLikes } from "../redux/posts/postSlice"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../components/ui/alert-dialog"
import PDFViewer from "../components/Preview/PDFViewer"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

export default function Dossier() {
  const navigate = useNavigate();
  const [postId, setPostId] = useState('');
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [summaryData, setSummaryData] = useState(null);
  const [examData, setExamData] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPostId(params.get('id'));
  }, [])
  const post = useSelector((state) => state.posts.posts.find((post) => (post._id).toString() === postId));
  const user = useSelector((state) => state.user.currentUser);
  

  const numberOfLikes = post?.likes.length;

  let formattedDate = 'Invalid date';
  try {
    formattedDate = formatDistanceToNow(new Date(post?.updatedAt), { addSuffix: true });
  } catch (e) {
    console.error('Invalid date value:', post?.updatedAt);
  }

  const handleSave = async () => {
    try {
      if (!user) {
        return toast.error('Please login to save this post');
      }

      dispatch(updateStart());
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${post._id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        return toast.error(data.message);
      }

      dispatch(updateSuccess(data.rest));
      setSaved(!saved);
      return toast.success(data.message);
    } catch (err) {
      dispatch(updateFailure(err.message));
      return toast.error(err.message);
    }
  }

  const handleLike = async () => {
    try {
      if(!user){
        return toast.error('Please login to like this post');
      }
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${post._id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if(!res.ok){
        return toast.error('Failed to like post');
      }
      if(res.ok){
        setLiked(!liked);
        if(data.offset === 1){
          dispatch(updatePostLikes({postId: post._id, userId: user._id, offset: 1}));
          return toast(data.message, {icon: '🥳'});
        }
        if(data.offset === -1){
          dispatch(updatePostLikes({postId: post._id, userId: user._id, offset: -1}));
          return toast(data.message, {icon: '🥹' });
        }
      }
    }catch(e){
      return toast.error(e.message);
    }
  }


  const handleFileDownload = async () => {
    toast.promise(
      (async () => {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/download-file/${post?._id}`, {
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to download file');
        }
  
        const blob = await response.blob();  // Get the file as a blob
        const fileName = post?.fileName || 'file';  // Get the file name from the post object
  
        download(blob, fileName, post?.fileType);  // Use downloadjs to trigger the download
  
        return 'File downloaded successfully';  // Success message to be displayed by toast
      })(),
      {
        loading: 'Downloading file...',
        success: 'File downloaded successfully!',
        error: 'Failed to download file',
      }
    );
  };

  const handleFilePreview = async () => {
    try{
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/preview/${post?._id}`, {
        credentials: 'include',
      });
      if(!response.ok){
        return toast.error('Failed to preview file');
      }
      const data = await response.json();
      setPreviewUrl(data.signedUrl);
      setIsPreviewing(true);
    }catch(e){
      return toast.error(e.message);
    }
  }
  
  

  useEffect(() => {
    if (user && user.savedPosts.includes(postId)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
    if (user && post?.likes.includes(user._id)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  },[postId, user, post?.likes]);

  const handleReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/posts/${post._id}/report`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return toast.error(data.message);
      }

      const updatedUser = {...user, blacklistedPosts: [...user.blacklistedPosts, post._id]};
      dispatch(updateSuccess(updatedUser));
      setLoading(false);
      navigate('/notes');
      return toast.success(data.message);
    } catch (err) {
      setLoading(false);
      return toast.error(err.message);
    }
  }

  const handleAIInsightsClick = () => {
    // Check if post has summary or exam data
    if (post?.summary) {
      console.log(post.summary[0]);
      setSummaryData(post.summary[0]);
    }
    
    if (post?.exam) {
      console.log(post.exam);
      setExamData(post.exam);
    }
    
    setIsAIModalOpen(true);
  };

  if(isPreviewing){
    return <PDFViewer url={previewUrl} />
  }

  return (
    <div className="sm:flex">
    <Link to={"/notes"} className="mt-8 ml-8">
      <Button variant="outline" className="">
        back
      </Button>
    </Link>
    <div className="container mx-auto xl:px-[300px] lg:px-[200px] md:px-[100px] py-8">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          {
            (post && post.author) &&
              <UserCard user={post.author} /> 
          }
          <h1 className="text-2xl font-bold">
            {post?.author?.username} / <span className="text-blue-500">{post?.title.replace(/ /g,"-")}</span>
          </h1>
          
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="hover:cursor-text">
            {post?.category.resourceType}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLike}>
            <StarIcon className={liked ? "h-4 mr-2 w-4 fill-current text-[#e2b340]" : "h-4 mr-2 w-4"} />
            {liked ? "Starred":"Star"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Bookmark className={saved ? "h-5 mr-2 w-5 fill-current text-blue-500" : "h-5 mr-2 w-5"} />
            {saved ? "Saved":"Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <StarIcon className="mr-1 h-4 w-4" />
          <span className="font-semibold">{numberOfLikes}</span>
          <span className="ml-1 text-muted-foreground">stars</span>
        </div>
        <div className="flex items-center">
          <EyeIcon className="mr-1 h-4 w-4" />
          <span className="font-semibold">4</span>
          <span className="ml-1 text-muted-foreground">watch</span>
        </div>
        <div className="flex items-center">
          <Bookmark className="mr-1 h-4 w-4" />
          <span className="font-semibold">3</span>
          <span className="ml-1 text-muted-foreground">saved</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="md:col-span-2">
          <div className="bg-card text-card-foreground border-2 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <Button size="sm" className="px-4 py-2 rounded-lg transition-colors duration-200 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transperant" onClick={handleFileDownload} >
                  Download
                </Button>
                <Button size="sm" className="px-4 py-2 rounded-lg transition-colors duration-200 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transperant" onClick={handleAIInsightsClick} >
                  AI Insights
                </Button>
                {post && post.fileType==="application/pdf" && 
                <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/50 hover:shadow-blue-600/50 transition-shadow duration-300 px-4 py-2 rounded-lg" onClick={handleFilePreview} >
                  Preview
                </Button>}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={loading}>
                      Report
                    </Button>
                                        
                      </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                              Are you sure you want to report this post? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-500" onClick={handleReport} disabled={loading}>Yes, Report</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
              </div>
            </div>
            <div className="flex justify-between">
            <div className="p-4">
              {/* <div className="flex items-center justify-between py-2 hover:bg-muted rounded px-2">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Description.md</span>
                </div>
              </div> */}
              <div className="flex items-center justify-between py-2 hover:bg-muted rounded px-2 cursor-pointer">
                <div className="flex items-center">
                  <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{post?.fileName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <span className="p-4 text-sm text-muted-foreground">
                Updated {formattedDate}
              </span>
            </div>
            </div>
              
          </div>

          {/* Descriotion Preview */}
          <div className="bg-card border-2 text-card-foreground rounded-lg shadow-sm p-6">
            <div className="flex border-b items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Description</h2>
              {/* <Button variant="ghost" size="sm">
                <FilePenLine className="mr-2 h-4 w-4" />
                Edit
              </Button> */}
            </div>
            <div 
            className="prose max-w-none post-content"
            dangerouslySetInnerHTML={{ __html: post?.desc }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* AI Insights Modal */}
    <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
      <DialogContent className="w-[90vw] max-w-6xl h-[90vh] max-h-screen flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Insights</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          AI Insights for the post
        </DialogDescription>
        <Tabs 
          defaultValue="summary" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full flex-1 flex flex-col"
        >
          <div className="sticky top-0 z-10 bg-background pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="exam">Exam Prep</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="summary" className="space-y-6 py-4 pr-2 h-full">
              {post?.processingStatus?.summary === "processing" && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-center space-x-2 py-8">
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                    <p className="text-blue-600 font-medium">Processing summary...</p>
                  </div>
                </div>
              )}
              
              {post?.processingStatus?.summary === "failed" && (
                <div className="p-4 border border-red-200 rounded-md">
                  <div className="flex items-center justify-center py-8">
                    <svg className="w-6 h-6 text-red-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-red-800 font-medium">Failed to process summary</p>
                  </div>
                </div>
              )}
              
              {summaryData && post?.processingStatus?.summary === "completed" && (
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">{summaryData.title || post?.title}</h3>
                  
                  {summaryData.overview && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-400">Overview</h4>
                      <p className="text-sm">{summaryData.overview}</p>
                    </div>
                  )}
                  
                  {summaryData.mainPoints && summaryData.mainPoints.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-400">Main Points</h4>
                      <ul className="list-disc pl-5 text-sm">
                        {summaryData.mainPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {summaryData.importantTerms && summaryData.importantTerms.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm text-gray-400">Important Terms</h4>
                      <div className="flex flex-wrap gap-1 text-sm">
                        {summaryData.importantTerms.map((term, index) => (
                          <span key={index} className="bg-blue-800 text-white px-2 py-1 rounded-md">{term}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {summaryData.benefits && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-400">Benefits</h4>
                      <p className="text-sm">{summaryData.benefits}</p>
                    </div>
                  )}
                  {summaryData.riskOrLimitations && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-400">Risk or Limitations</h4>
                      <p className="text-sm">{summaryData.riskOrLimitations}</p>
                    </div>
                  )}
                  {summaryData.recommendations && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-400">Recommendations</h4>
                      <p className="text-sm">{summaryData.recommendations}</p>
                    </div>
                  )}
                  {summaryData.conclusion && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-400">Conclusion</h4>
                      <p className="text-sm">{summaryData.conclusion}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="exam" className="space-y-6 py-4 pr-2 h-full">
              {post?.processingStatus?.examQuestions === "processing" && (
                <div className="p-4 border rounded-md">
                  <div className="flex items-center justify-center space-x-2 py-8">
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                    <p className="text-blue-600 font-medium">Processing exam questions...</p>
                  </div>
                </div>
              )}
              
              {post?.processingStatus?.examQuestions === "failed" && (
                <div className="p-4 border border-red-200 rounded-md">
                  <div className="flex items-center justify-center py-8">
                    <svg className="w-6 h-6 text-red-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-red-800 font-medium">Failed to process exam questions</p>
                  </div>
                </div>
              )}
              
              {examData && post?.processingStatus?.examQuestions === "completed" && (
                examData.map((exam, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <div className="mb-3">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <p className="text-sm">{exam.question}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-medium">Answer</h4>
                      <p className="text-sm">{exam.answer}</p>
                    </div>
                    
                    {exam.keyPoints && exam.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-400">Key Points</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {exam.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {exam.tips && exam.tips.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-400">Tips</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {exam.tips.map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        {/* <div className="mt-4">
          <Button 
            className="w-full" 
            onClick={() => setIsAIModalOpen(false)}
          >
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
    </div>
  )
}