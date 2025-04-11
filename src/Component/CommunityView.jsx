"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  MessageSquare,
  Plus,
  Share2,
  Trash2,
  ArrowLeft,
  Send,
  Users,
  X,
  Lock,
  Unlock,
  FileText,
  BookOpen,
} from "lucide-react"
import { socket } from "../App"
import { useMediaQuery, useTheme } from "@mui/material"
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  Checkbox,
  OutlinedInput,
  InputLabel,
  Chip,
  Avatar, // Import Avatar
} from "@mui/material"
import TagSelector from "./tag-selector"

// API base URL
const API_BASE_URL = "https://webdev.cse.buffalo.edu/hci/api/api/droptable"

export default function CommunityView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChatRoom, setShowChatRoom] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [members, setMembers] = useState([])
  const [studySets, setStudySets] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [showAddStudySetDialog, setShowAddStudySetDialog] = useState(false)
  const [studySetName, setStudySetName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [templateContent, setTemplateContent] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Name, 2: Template, 3: Content
  const messagesEndRef = useRef(null)
  const [showMembers, setShowMembers] = useState(false)
  const [copiedSetId, setCopiedSetId] = useState(null)
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })
  const [membersOnly, setMembersOnly] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [accessType, setAccessType] = useState("everyone") // "everyone", "allMembers", "specificMembers"
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [uploading, setUploading] = useState(false)
  const [userPreferences, setUserPreferences] = useState([])
  const [sortedStudySets, setSortedStudySets] = useState([])
  const [userCategories, setUserCategories] = useState([])
  const [shouldShowPics, setShouldShowPics] = useState(true); // Add state for pic visibility
  const [studySetPage, setStudySetPage] = useState(0)
  const [hasMoreStudySets, setHasMoreStudySets] = useState(true)
  const PAGE_SIZE = 10

  // Add school categories for tag selection
  const school_categories = {
    Math: [
      "Algebra",
      "Geometry",
      "Calculus",
      "Trigonometry",
      "Statistics",
      "Probability",
      "Functions",
      "Matrices",
      "Equations",
      "Graphs",
    ],
    Science: [
      "Physics",
      "Chemistry",
      "Biology",
      "Earth Science",
      "Astronomy",
      "Genetics",
      "Ecology",
      "Laboratory",
      "Periodic Table",
      "Experiments",
    ],
    Literature: [
      "Novels",
      "Poetry",
      "Shakespeare",
      "Analysis",
      "Short Stories",
      "Fiction",
      "Non-fiction",
      "Literary Devices",
      "Themes",
      "Book Reviews",
    ],
    History: [
      "Ancient Civilizations",
      "World Wars",
      "U.S. History",
      "Revolutions",
      "Geography",
      "Historical Figures",
      "Wars",
      "Presidents",
      "Political Movements",
      "Artifacts",
    ],
    Geography: [
      "Maps",
      "Countries",
      "Capitals",
      "Climate",
      "Landforms",
      "Physical Geography",
      "Urbanization",
      "Migration",
      "Natural Resources",
      "Time Zones",
    ],
    "Foreign Languages": [
      "Spanish",
      "French",
      "German",
      "Italian",
      "Chinese",
      "Japanese",
      "Vocabulary",
      "Grammar",
      "Pronunciation",
      "Language Exchange",
    ],
    Art: [
      "Painting",
      "Sculpture",
      "Drawing",
      "Digital Art",
      "Art History",
      "Canvas",
      "Portraits",
      "Abstract",
      "Artists",
      "Creativity",
    ],
    Music: [
      "Instruments",
      "Composers",
      "Genres",
      "Music Theory",
      "Choir",
      "Band",
      "Symphony",
      "Singing",
      "Sheet Music",
      "Rhythm",
    ],
    "Physical Education": [
      "Sports",
      "Fitness",
      "Exercises",
      "Health",
      "Endurance",
      "Teamwork",
      "Running",
      "Strength Training",
      "Flexibility",
      "Physical Health",
    ],
    Technology: [
      "Coding",
      "Software",
      "Hardware",
      "Programming",
      "Artificial Intelligence",
      "Web Development",
      "Robotics",
      "Cybersecurity",
      "Databases",
      "Machine Learning",
    ],
    "Business Studies": [
      "Economics",
      "Finance",
      "Marketing",
      "Entrepreneurship",
      "Accounting",
      "Management",
      "Business Plans",
      "Investment",
      "Trade",
      "Corporations",
    ],
    Philosophy: [
      "Ethics",
      "Logic",
      "Metaphysics",
      "Epistemology",
      "Plato",
      "Aristotle",
      "Morality",
      "Knowledge",
      "Free Will",
      "Political Philosophy",
    ],
    Psychology: [
      "Behavior",
      "Cognition",
      "Mental Health",
      "Emotions",
      "Motivation",
      "Perception",
      "Social Psychology",
      "Developmental Psychology",
      "Therapy",
      "Neuroscience",
    ],
    Sociology: [
      "Society",
      "Culture",
      "Social Change",
      "Inequality",
      "Groups",
      "Socialization",
      "Deviance",
      "Families",
      "Education Systems",
      "Race & Ethnicity",
    ],
    Economics: [
      "Supply and Demand",
      "Inflation",
      "GDP",
      "Trade",
      "Markets",
      "Microeconomics",
      "Macroeconomics",
      "Economic Systems",
      "Resources",
      "Taxes",
    ],
    "Health Education": [
      "Nutrition",
      "Mental Health",
      "Wellness",
      "Exercise",
      "Hygiene",
      "Diseases",
      "Prevention",
      "Vaccines",
      "Sexual Health",
      "First Aid",
    ],
    "Home Economics": [
      "Cooking",
      "Sewing",
      "Budgeting",
      "Interior Design",
      "Childcare",
      "Household Management",
      "Nutrition",
      "Textiles",
      "Family Planning",
      "Sustainability",
    ],
    "Public Speaking": [
      "Presentations",
      "Rhetoric",
      "Speech Writing",
      "Communication Skills",
      "Confidence",
      "Debates",
      "Persuasion",
      "Audience",
      "Body Language",
      "Speech Delivery",
    ],
    "Technology & Engineering": [
      "Robotics",
      "Engineering Design",
      "CAD (Computer-Aided Design)",
      "Prototyping",
      "Electronics",
      "Renewable Energy",
      "Structural Engineering",
      "Computer Engineering",
      "3D Printing",
      "Programming",
    ],
    Debate: [
      "Argumentation",
      "Persuasion",
      "Logical Fallacies",
      "Evidence",
      "Counterarguments",
      "Rhetorical Strategies",
      "Public Speaking",
      "Research",
      "Debating Styles",
      "Cross-examination",
    ],
    "Environmental Science": [
      "Ecosystems",
      "Conservation",
      "Climate Change",
      "Pollution",
      "Sustainability",
      "Renewable Energy",
      "Biodiversity",
      "Recycling",
      "Environmental Policy",
      "Environmental Impact",
    ],
    Theatre: [
      "Acting",
      "Stage Design",
      "Directing",
      "Playwriting",
      "Auditions",
      "Performances",
      "Costumes",
      "Set Construction",
      "Lighting",
      "Rehearsals",
    ],
    Law: [
      "Legal Studies",
      "Constitutional Law",
      "Criminal Law",
      "Civil Law",
      "Contracts",
      "Courts",
      "Lawyers",
      "Law Enforcement",
      "Legal Systems",
      "Human Rights",
    ],
    Education: [
      "Pedagogy",
      "Classroom Management",
      "Learning Styles",
      "Curriculum Development",
      "Assessment",
      "Special Education",
      "Teaching Strategies",
      "Technology in Education",
      "Teacher Training",
      "Online Learning",
    ],
    "Career Development": [
      "Job Search",
      "Internships",
      "Networking",
      "Resumes",
      "Interviews",
      "Professional Skills",
      "Career Pathways",
      "Entrepreneurship",
      "Certifications",
      "Personal Branding",
    ],
  }

  // Theme and responsive breakpoints
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  // Define template options
  const templateOptions = [
    {
      id: 1,
      name: "Basic Flashcards",
      type: "flashcards",
      icon: BookOpen,
      content: [{ front: "", back: "" }],
    },
    {
      id: 2,
      name: "Multiple Choice",
      type: "multiple_choice",
      icon: FileText,
      content: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
    },
    {
      id: 3,
      name: "Fill in the Blank",
      type: "fill_in_blank",
      icon: FileText,
      content: [{ text: "", answer: "" }],
    },
    {
      id: 4,
      name: "Matching",
      type: "matching",
      icon: FileText,
      content: [{ left: "", right: "" }],
    },
  ]

  // Handle template change
  const handleTemplateChange = (template) => {
    setSelectedTemplateId(template.id)
    setSelectedTemplate(template)
  }

  // Add viewport meta tag to document head
  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]')

    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta")
      viewportMeta.name = "viewport"
      document.head.appendChild(viewportMeta)
    }

    // Set the content attribute
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"

    // Clean up function
    return () => {
      // Optional: remove or reset the viewport meta tag when component unmounts
      // viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
  }, [])

  // Get base URL for sharing
  const getBaseUrl = () => {
    const isProduction = window.location.hostname.includes("webdev.cse.buffalo.edu")
    if (isProduction) {
      return `${window.location.origin}/hci/teams/droptable`
    } else {
      return window.location.origin
    }
  }

  // Helper function to format study set type for display
  const formatStudySetType = (type) => {
    if (!type) return ""

    // Replace underscores with spaces
    const typeWithSpaces = type.replace(/_/g, " ")

    // Capitalize first letter of each word
    return typeWithSpaces
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
  }

  useEffect(() => {
    fetchCommunityDetails()
    fetchUserCategories()
    // --- Add effect to read visibility setting --- 
    const storedSetting = localStorage.getItem("showProfilePics");
    setShouldShowPics(storedSetting === null ? true : storedSetting === "true");

    // Add listener for storage changes
    const handleStorageChange = (event) => {
      if (event.key === "showProfilePics") {
        setShouldShowPics(event.newValue === null ? true : event.newValue === "true");
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
    // --- End of added effect ---
  }, [id])

  // Auto-scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    fetchUserPreferences()
  }, [])

  // Add this useEffect to sort study sets whenever they or user preferences change
  useEffect(() => {
    sortStudySetsByPreferences()
  }, [studySets, userPreferences])

  // Add a useEffect to log user preferences and study sets for debugging
  useEffect(() => {
    if (userPreferences.length > 0) {
      console.log("Current user preferences:", userPreferences)
      console.log(
          "Study sets with categories:",
          studySets.map((set) => ({
            title: set.title,
            categories: set.categories,
            matches: set.categories?.some((cat) => userPreferences.includes(cat)),
          })),
      )
    }
  }, [userPreferences, studySets])

  // Add this function to fetch user's category preferences
  const fetchUserPreferences = async () => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    if (!token || !userId) {
      return
    }

    try {
      // Fetch user badges to get category preferences
      const response = await fetch(`${API_BASE_URL}/user-badge?userID=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user preferences")
      }

      const data = await response.json()

      // Extract category names from badge attributes
      if (data && data[0] && data[0].length > 0) {
        // Look for badges with type "category" or directly use the category name
        const preferences = data[0]
            .map((badge) => {
              // Try to get category from attributes first
              if (badge.attributes && badge.attributes.category) {
                return badge.attributes.category
              }
              // If no category in attributes, use the badge name directly
              return badge.name
            })
            .filter(Boolean) // Remove any undefined/null values

        console.log("User preferences extracted:", preferences)
        setUserPreferences(preferences)
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error)
    }
  }

  // Add this function to sort study sets based on user preferences
  const sortStudySetsByPreferences = () => {
    if (!studySets.length) {
      setSortedStudySets([])
      return
    }

    // Create a copy of study sets to sort
    const sorted = [...studySets].sort((a, b) => {
      // Check if study set categories match user preferences
      const aMatches = a.categories?.some((category) => userPreferences.includes(category)) || false

      const bMatches = b.categories?.some((category) => userPreferences.includes(category)) || false

      // Sort matching sets first
      if (aMatches && !bMatches) return -1
      if (!aMatches && bMatches) return 1
      return 0
    })

    console.log(
        "Sorted study sets:",
        sorted.map((set) => ({
          title: set.title,
          categories: set.categories,
          matches: set.categories?.some((cat) => userPreferences.includes(cat)),
        })),
    )

    setSortedStudySets(sorted)
  }

  // Add this function to check if a study set matches user preferences
  const matchesUserInterests = (studySet) => {
    if (!userPreferences.length) return false
    if (!studySet.categories || !studySet.categories.length) return false

    // Check if any of the study set categories match user preferences
    return studySet.categories.some(
        (category) => userPreferences.includes(category) || userPreferences.some((pref) => pref === category),
    )
  }

  const fetchCommunityDetails = () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("You must be logged in to view this community")
      setLoading(false)
      return
    }

    // Fetch community details
    fetch(`${API_BASE_URL}/groups/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          // Transform API data to match our component's expected format
          const communityData = {
            id: data.id,
            name: data.name || "Community",
            description: data.description || "No description available",
            authorId: data.ownerID,
          }

          setCommunity(communityData)

          // Fetch members
          fetchMembers()

          // Fetch messages
          fetchMessages()

          // Fetch study sets
          fetchStudySets()

          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching community:", error)
          setError("Failed to load community details")
          setLoading(false)
        })
  }

  const fetchMembers = () => {
    const token = sessionStorage.getItem("token")

    fetch(`${API_BASE_URL}/group-members?groupID=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(async (data) => {
          if (data && data[0] && data[0].length > 0) {
            // Fetch user details for each member
            const membersWithDetails = await Promise.all(
                data[0].map(async (member) => {
                  try {
                    // Fetch user details
                    const userResponse = await fetch(`${API_BASE_URL}/users/${member.userID}`, {
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    })

                    if (!userResponse.ok) {
                      throw new Error(`Failed to fetch user data: ${userResponse.status}`)
                    }

                    const userData = await userResponse.json()

                    // --- Extract avatar/profile picture using prioritization ---
                    let pictureUrl = null;
                    const topLevelPic = userData.picture || userData.avatar;
                    const attributePic = userData.attributes?.picture || userData.attributes?.profilePicture;

                    if (topLevelPic && (String(topLevelPic).startsWith('http') || String(topLevelPic).startsWith('/'))) {
                      pictureUrl = topLevelPic;
                    } else if (attributePic && (String(attributePic).startsWith('http') || String(attributePic).startsWith('/'))) {
                      pictureUrl = attributePic;
                    } else if (topLevelPic) {
                      pictureUrl = topLevelPic; // Fallback to top-level (might be Base64)
                    } else if (attributePic) {
                      pictureUrl = attributePic; // Fallback to attribute (might be Base64)
                    }
                    // --- End of avatar extraction ---

                    return {
                      id: member.id,
                      userID: member.userID,
                      email: userData.email,
                      isAdmin: member.userID === community?.authorId,
                      picture: pictureUrl, // Add picture to the member object
                    }
                  } catch (error) {
                    console.error("Error fetching user details:", error)
                    return {
                      id: member.id,
                      userID: member.userID,
                      email: "Unknown User",
                      isAdmin: member.userID === community?.authorId,
                      picture: null, // Default picture to null on error
                    }
                  }
                }),
            )
            setMembers(membersWithDetails)
          } else {
            // If no members returned, at least add the owner as admin
            setMembers([
              {
                id: community?.authorId,
                userID: community?.authorId,
                email: "Owner",
                isAdmin: true,
              },
            ])
          }
        })
        .catch((error) => {
          console.error("Error fetching members:", error)
          setMembers([
            {
              id: community?.authorId,
              userID: community?.authorId,
              email: "Owner",
              isAdmin: true,
            },
          ])
        })
  }

  // Add the fetchUserCategories function after the fetchMembers function
  const fetchUserCategories = async () => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    if (!token || !userId) {
      return
    }

    try {
      // Fetch user badges
      const response = await fetch(`${API_BASE_URL}/user-badge?userID=${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user badges")
      }

      const data = await response.json()

      // Extract category names from badge attributes
      if (data && data[0] && data[0].length > 0) {
        // First try to get categories from badge attributes
        let categories = data[0]
            .filter((badge) => badge.attributes && badge.attributes.type === "category")
            .map((badge) => badge.attributes.category || badge.name)
            .filter(Boolean)

        // If no categories found in attributes, try to get them from badge names
        if (categories.length === 0) {
          // Get badge IDs first
          const badgeIds = data[0].map((userBadge) => userBadge.badgeID).filter(Boolean)

          // Fetch actual badge details if we have IDs
          if (badgeIds.length > 0) {
            const badgePromises = badgeIds.map((badgeId) =>
                fetch(`${API_BASE_URL}/badge/${badgeId}`, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }).then((res) => res.json()),
            )

            const badgeResults = await Promise.all(badgePromises)

            // Extract category names from badge names
            categories = badgeResults
                .filter((badge) => badge.attributes && badge.attributes.type === "category")
                .map((badge) => badge.name)
                .filter(Boolean)
          }
        }

        console.log("User categories from badges:", categories)
        setUserCategories(categories)
      }
    } catch (error) {
      console.error("Error fetching user categories:", error)
    }
  }

  useEffect(() => {
    if (userCategories.length > 0) {
      fetchStudySets()
    }
  }, [userCategories])

  const fetchMessages = () => {
    const token = sessionStorage.getItem("token")

    fetch(`${API_BASE_URL}/posts?parentID=${id}&type=message`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((result) => {
          if (result && result[0] && result[0].length > 0) {
            // Transform API data to match our component's expected format
            const messagesData = result[0].map((message, idx) => ({
              id: `msg-${message.id}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
              sender: message.authorName || "User",
              text: message.content || "No message content",
              timestamp: message.createdAt || new Date().toISOString(),
            }))
            setMessages(messagesData)
          } else {
            // Set default welcome messages if none exist
            const initialMessages = [
              {
                id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sender: "System",
                text: "Welcome to the community chat!",
                timestamp: new Date().toISOString(),
              },
            ]
            setMessages(initialMessages)
          }
        })
        .catch((error) => {
          console.error("Error fetching messages:", error)
          // Set default welcome message if fetch fails
          const initialMessages = [
            {
              id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              sender: "System",
              text: "Welcome to the community chat!",
              timestamp: new Date().toISOString(),
            },
          ]
          setMessages(initialMessages)
        })
  }

  // Update the fetchStudySets function to enhance study sets with match information
  // Replace or modify the existing fetchStudySets function with this enhanced version
  // that adds matchesUserInterests and matchCount properties to each study set
  const fetchStudySets = () => {
    const token = sessionStorage.getItem("token")
    const currentCommunityId = id // Keep as string for comparison
    const userId = sessionStorage.getItem("user") // Get current user ID

    // First check if the user is a member of this community
    const checkMembership = async () => {
      try {
        if (!userId) return false;

        const membershipResponse = await fetch(`${API_BASE_URL}/group-members?groupID=${currentCommunityId}&userID=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });

        if (!membershipResponse.ok) {
          console.warn("Failed to check membership status");
          return false;
        }

        const membershipData = await membershipResponse.json();
        return membershipData && membershipData[0] && membershipData[0].length > 0;
      } catch (error) {
        console.error("Error checking membership:", error);
        return false;
      }
    };

    // Try to fetch study sets specifically for this community
    checkMembership().then(isMember => {
    fetch(`${API_BASE_URL}/posts?type=study_set`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
          .then(async (result) => { // Make this async to await author details
          if (result && result[0] && result[0].length > 0) {
            // First, filter to only include study sets for this community
              const communityStudySetsPosts = result[0].filter((post) => {
              // Try to parse the content to check for communityId
              let contentObj = null
              try {
                if (post.content && typeof post.content === "string") {
                  contentObj = JSON.parse(post.content)
                }
              } catch (e) {
                console.warn("Could not parse content for post", post.id)
              }

              // Check if communityId is in the content
              if (contentObj && contentObj.communityId === currentCommunityId) {
                return true
              }

              // Check if the post has our custom attribute that indicates the community
              if (post.attributes && post.attributes.communityId === currentCommunityId) {
                return true
              }

              // Check if parentID matches the community ID
              if (post.parentID && String(post.parentID) === currentCommunityId) {
                return true
              }

                // Also check the groupID as string comparison
              const postGroupId = String(post.groupID || "")
              const belongsViaGroupId = postGroupId === currentCommunityId

              return (
                  belongsViaGroupId ||
                  (contentObj && contentObj.communityId === currentCommunityId) ||
                  (post.attributes && post.attributes.communityId === currentCommunityId) ||
                  (post.parentID && String(post.parentID) === currentCommunityId)
              )
            })
                  .filter((post) => {
                    // Check if the study set is members-only and filter accordingly
                    let contentObj = null;
                    try {
                      if (post.content && typeof post.content === "string") {
                        contentObj = JSON.parse(post.content);
                      }
                    } catch (e) {
                      console.warn("Could not parse content for post", post.id);
                    }

                    // Check if current user is the creator of the post
                    const isCreator = String(post.authorID) === String(userId);

                    // If user is the creator, always show the post
                    if (isCreator) {
                      return true;
                    }

                    // Get access control settings
                    const postAccessType =
                        contentObj?.accessType ||
                        post.attributes?.accessType ||
                        (contentObj?.membersOnly || post.attributes?.membersOnly ? "allMembers" : "everyone");

                    const selectedMembers =
                        contentObj?.selectedMembers ||
                        post.attributes?.selectedMembers ||
                        [];

                    // If access is for everyone, show the post
                    if (postAccessType === "everyone") {
                      return true;
                    }

                    // If access is for all members and user is a member, show the post
                    if (postAccessType === "allMembers" && isMember) {
                      return true;
                    }

                    // If access is for specific members, check if user is in the list
                    if (postAccessType === "specificMembers") {
                      if (selectedMembers.includes(parseInt(userId)) || selectedMembers.includes(userId)) {
                        return true;
                      }
                      return false;
                    }

                    // For backward compatibility, check the old membersOnly flag
                    const isMembersOnly =
                        (contentObj && contentObj.membersOnly === true) ||
                        (post.attributes && post.attributes.membersOnly === true);

                    // If it's members-only and user is not a member, filter it out
                    if (isMembersOnly && !isMember) {
                      return false;
                    }

                    // Default behavior - if not members-only, show to everyone
                    return !isMembersOnly || (isMembersOnly && isMember);
                  });

              // Fetch author details for each filtered post
              const studySetsData = await Promise.all(communityStudySetsPosts.map(async (post) => {
                try {
                  // Fetch author details (including picture)
                  let authorDetails = { id: post.authorID, email: "Anonymous", picture: null }; // Default
                  if (post.authorID) {
                    try {
                      const userResponse = await fetch(`${API_BASE_URL}/users/${post.authorID}`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json"
                        }
                      });
                      if (userResponse.ok) {
                        const userData = await userResponse.json();
                        // Picture prioritization logic
                        let pictureUrl = null;
                        const topLevelPic = userData.picture || userData.avatar;
                        const attributePic = userData.attributes?.picture || userData.attributes?.profilePicture;
                        if (topLevelPic && (String(topLevelPic).startsWith('http') || String(topLevelPic).startsWith('/'))) {
                            pictureUrl = topLevelPic;
                        } else if (attributePic && (String(attributePic).startsWith('http') || String(attributePic).startsWith('/'))) {
                            pictureUrl = attributePic;
                        } else if (topLevelPic) {
                            pictureUrl = topLevelPic;
                        } else if (attributePic) {
                            pictureUrl = attributePic;
                        }
                        authorDetails = {
                          id: userData.id,
                          email: userData.email || "Unknown",
                          picture: pictureUrl // Use prioritized picture
                        };
                      } else {
                        console.warn(`Failed to fetch author details for ID ${post.authorID}: ${userResponse.status}`);
                      }
                    } catch (fetchError) {
                      console.error(`Error fetching author ${post.authorID}:`, fetchError);
                    }
                  }

                  // Try to parse the content as JSON, but handle invalid JSON gracefully
                  let content = {}
                  try {
                    if (post.content && typeof post.content === "string") {
                      content = JSON.parse(post.content)
                      if (!content.name) content.name = "Untitled Study Set"
                      if (!content.type) content.type = "flashcards"
                      if (!Array.isArray(content.content)) content.content = []
                      }
                    } catch (parseError) {
                      console.warn("Could not parse post content as JSON:", parseError.message)
                      content = {
                        name: "Untitled Study Set",
                        type: "flashcards",
                        content: [{ front: post.content || "Content unavailable", back: "" }],
                      }
                    }

                  const accessType =
                      content.accessType ||
                      post.attributes?.accessType ||
                      (content.membersOnly || post.attributes?.membersOnly ? "allMembers" : "everyone");

                  const selectedMembersList =
                      content.selectedMembers ||
                      post.attributes?.selectedMembers ||
                      [];

                    // Extract categories and tags from different possible locations
                    let categories = []
                    let tags = []

                    // Try to get categories and tags from content
                    if (content.categories) {
                      categories = Array.isArray(content.categories) ? content.categories : []
                    }

                    if (content.tags) {
                      tags = Array.isArray(content.tags) ? content.tags : []
                    }

                    // Also check post attributes for categories and tags (used by template-manager)
                    if (post.attributes) {
                      // If attributes has categories as a string, split it
                      if (post.attributes.categories && typeof post.attributes.categories === "string") {
                        const attrCategories = post.attributes.categories.split(",").filter(Boolean)
                        // Merge with existing categories, avoiding duplicates
                        categories = [...new Set([...categories, ...attrCategories])]
                      }

                      // If attributes has tags as a string, split it
                      if (post.attributes.tags && typeof post.attributes.tags === "string") {
                        const attrTags = post.attributes.tags.split(",").filter(Boolean)
                        // Merge with existing tags, avoiding duplicates
                        tags = [...new Set([...tags, ...attrTags])]
                      }
                    }

                    return {
                      id: post.id,
                      title: content.name || "Untitled Study Set",
                    description: `Created by ${authorDetails.email.split("@")[0] || "Anonymous"}`,
                      type: content.type || "flashcards",
                      content: content.content || [],
                      fileId: post.fileId,
                      groupID: post.groupID,
                      communityId: content.communityId || post.attributes?.communityId || post.parentID || post.groupID,
                    creator: authorDetails.id,
                    creatorPicture: authorDetails.picture, // Add creator picture
                    creatorEmail: authorDetails.email, // Add creator email for initial
                    membersOnly: content.membersOnly || post.attributes?.membersOnly || accessType !== "everyone",
                    accessType: accessType,
                    selectedMembers: selectedMembersList,
                      categories: categories,
                      tags: tags,
                      createdAt: post.createdAt || post.created || new Date().toISOString(),
                      matchesUserInterests: false, // We'll set this later
                      matchCount: 0, // We'll calculate this later
                    }
                  } catch (error) {
                    console.error("Error processing post:", error)
                    return null
                  }
              }));

            // Calculate match count and flag for each study set
              const enhancedStudySets = studySetsData.filter(Boolean).map((studySet) => { // Add filter(Boolean) here
              // Count how many categories match user interests
              const matchCount = studySet.categories.filter((cat) => userCategories.includes(cat)).length

              return {
                ...studySet,
                matchesUserInterests: matchCount > 0,
                matchCount: matchCount,
              }
            })

            // Sort study sets: first by match count (descending), then by creation date (newest first)
            const sortedStudySets = enhancedStudySets.sort((a, b) => {
              // First sort by match count
              if (a.matchCount !== b.matchCount) {
                return b.matchCount - a.matchCount
              }

              // If match counts are equal, sort by creation date (newest first)
              return new Date(b.createdAt) - new Date(a.createdAt)
            })

            console.log("User categories:", userCategories)
            console.log("Sorted study sets:", sortedStudySets)

            setStudySets(sortedStudySets)
          } else {
            setStudySets([])
          }
        })
        .catch((error) => {
          console.error("Error fetching study sets:", error)
          setStudySets([])
        })
    });
  }

  const handleBack = () => {
    navigate("/community")
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setSelectedTemplateId(template.id)

    // Initialize with empty content based on the template type
    let initialContent = []
    if (template.type === "flashcards") {
      initialContent = [{ front: "", back: "" }]
    } else if (template.type === "multiple_choice") {
      initialContent = [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
    } else if (template.type === "fill_in_blank") {
      initialContent = [{ text: "", answer: "" }]
    } else if (template.type === "matching") {
      initialContent = [{ left: "", right: "" }]
    }

    setTemplateContent(initialContent)
    setCurrentStep(3) // Move to content editing step
  }

  const handleAddStudyMaterial = () => {
    setShowAddStudySetDialog(true)
  }

  const createStudySet = async () => {
    try {
      if (!studySetName.trim()) {
        alert("Please enter a name for your study set")
        return
      }

      if (!selectedTemplate) {
        alert("Please select a template")
        return
      }

      if (!templateContent || templateContent.length === 0) {
        alert("Please add some content to your study set")
        return
      }

      const token = sessionStorage.getItem("token")
      const userId = sessionStorage.getItem("user")
      const currentCommunityId = id

      if (!token || !userId) {
        alert("You must be logged in to add study material")
        return
      }

      // Format the post data according to the API requirements
      const postData = {
        content: JSON.stringify({
          name: studySetName,
          type: selectedTemplate.type,
          content: templateContent,
          communityId: currentCommunityId,
          membersOnly: membersOnly,
          selectedMembers: accessType === "specificMembers" ? selectedMembers : [],
          categories: selectedCategories,
          tags: selectedTags,
        }),
        type: "study_set",
        authorID: Number.parseInt(userId),
        groupID: Number.parseInt(currentCommunityId) || 0,
        attributes: {
          description: "Study set created in community",
          communityId: currentCommunityId,
          membersOnly: membersOnly,
          accessType: accessType,
          selectedMembers: accessType === "specificMembers" ? selectedMembers : [],
          categories: selectedCategories,
          tags: selectedTags,
        },
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to create study set: ${response.status}`)
      }

      const result = await response.json()

      // Add the new study set to the state with proper structure
      const newStudySet = {
        id: result.id,
        title: studySetName,
        description: "Created by you",
        type: selectedTemplate.type,
        content: templateContent,
        groupID: Number.parseInt(currentCommunityId) || 0,
        communityId: currentCommunityId,
        membersOnly: membersOnly,
        categories: selectedCategories,
        tags: selectedTags,
      }

      // Update state in a safe way
      setStudySets((prevSets) => [...prevSets, newStudySet])

      // Reset form state
      setStudySetName("")
      setSelectedTemplate(null)
      setTemplateContent([])
      setMembersOnly(false)
      setSelectedMembers([])
      setAccessType("everyone")
      setCurrentStep(1)
      setShowAddStudySetDialog(false)
      setSelectedCategories([])
      setSelectedTags([])

      // Refresh the study sets to ensure we have the latest data
      setTimeout(() => {
        fetchStudySets()
      }, 1000)

      alert("Study set created successfully!")
    } catch (error) {
      console.error("Error creating study set:", error)
      alert(`Failed to create study set: ${error.message}`)
    }
  }

  const handleAddMember = () => {
    const token = sessionStorage.getItem("token")

    if (!token) {
      alert("You must be logged in to add a member")
      return
    }

    // In a real implementation, you would show a modal to select a user
    // For now, we'll just simulate adding a member with a prompt
    const userEmail = prompt("Enter the email of the user you want to add:")

    if (!userEmail) return

    // First, search for the user by email
    fetch(`${API_BASE_URL}/users?email=${userEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((result) => {
          if (result && result[0] && result[0].length > 0) {
            const userId = result[0][0].id

            // Now add the user to the group using the correct endpoint
            return fetch(`${API_BASE_URL}/group-members`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userID: userId,
                groupID: id,
              }),
            })
          } else {
            throw new Error("User not found")
          }
        })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(() => {
          // Refresh the members list
          fetchMembers()
          alert("Member added successfully!")
        })
        .catch((error) => {
          console.error("Error adding member:", error)
          alert("Failed to add member. Please check the email and try again.")
        })
  }

  const handleViewStudySet = (studySet) => {
    // Navigate to a new route for viewing the study set with state
    navigate(`/community/${id}/study-set/${studySet.id}`, {
      state: {
        studySet: {
          ...studySet,
          content: studySet.content,
        },
      },
    })
  }

  const handleDeleteStudySet = (id, creator) => {
    const token = sessionStorage.getItem("token")
    const userId = sessionStorage.getItem("user")

    if (!token || !userId) {
      alert("You must be logged in to delete a study set")
      return
    }
    if (userId != creator) {
      alert("You are not the creator of this post")
      return
    }
    fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }

          // Remove the study set from state
          const updatedStudySets = studySets.filter((set) => set.id !== id)
          setStudySets(updatedStudySets)
        })
        .catch((error) => {
          console.error("Error deleting study set:", error)
          alert("Failed to delete study set. Please try again.")
        })
  }

  const handleShareStudySet = (id) => {
    // Use the getBaseUrl function to create the correct link
    const studySetLink = `${getBaseUrl()}/community/${community.id}/study-set/${id}`

    navigator.clipboard
        .writeText(studySetLink)
        .then(() => {
          // Set the copied state for this specific study set
          setCopiedSetId(id)

          // Reset after 2 seconds
          setTimeout(() => {
            setCopiedSetId(null)
          }, 2000)
        })
        .catch((err) => {
          console.error("Could not copy text: ", err)
        })
  }

  // Updated handleOpenChatRoom function
  const handleOpenChatRoom = () => {
    console.log("Opening community chat room for community ID:", id)

    if (!socket || !socket.connected) {
      console.error("Socket not connected, attempting to connect")

      // Create a notification to inform the user
      showNotification("Connecting to chat server...", "info")

      // Try to use the existing socket instance from import
      if (socket) {
        socket.connect()

        // Give the socket a moment to connect
        setTimeout(() => {
          if (socket.connected) {
            navigateToChatRoom()
          } else {
            console.error("Failed to connect to chat server")
            showNotification("Chat server connection failed. Please try again.", "error")
          }
        }, 2000)
      } else {
        console.error("Socket instance not available")
        showNotification("Chat service unavailable", "error")
      }
      return
    }

    // Socket is already connected, navigate immediately
    navigateToChatRoom()
  }

  // Helper function to navigate to the community chat room
  const navigateToChatRoom = () => {
    try {
      // Store community ID for potential reconnections
      sessionStorage.setItem("activeCommunityID", id)
      sessionStorage.setItem("activeCommunityRoomID", `community-${id}`)

      // Create payload for room creation/joining
      const payload = {
        userID: Number.parseInt(sessionStorage.getItem("user")),
        communityID: Number.parseInt(id),
        roomID: `community-${id}`,
      }

      console.log("Emitting community join-room event with payload:", payload)

      // Emit socket event for joining community room (the server will create it if it doesn't exist)
      socket.emit("/community/join-room", payload)

      // Navigate to the community chat page
      navigate(`/community/${id}/chat`)
    } catch (error) {
      console.error("Error navigating to community chat:", error)
      showNotification("Failed to open chat room", "error")
    }
  }

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 3000)
  }

  const handleBackToCommunity = () => {
    setShowChatRoom(false)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const token = sessionStorage.getItem("token")
    const user = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : null

    if (!token || !user) {
      alert("You must be logged in to send a message")
      return
    }

    const messageData = {
      content: newMessage,
      authorID: user.id,
      parentID: id,
      type: "message",
    }

    // Optimistically add the message to the UI
    const optimisticMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: "You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, optimisticMessage])
    setNewMessage("") // Clear input immediately

    fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((result) => {
          // Message sent successfully
          console.log("Message sent successfully:", result)
        })
        .catch((error) => {
          console.error("Error sending message:", error)
          alert("Failed to send message. Please try again.")

          // Remove the optimistic message on error
          setMessages(messages.filter((msg) => msg.id !== optimisticMessage.id))
        })
  }

  const handleAddItem = () => {
    let newItemTemplate = {}

    if (selectedTemplate.type === "flashcards") {
      newItemTemplate = { front: "", back: "" }
    } else if (selectedTemplate.type === "multiple_choice") {
      newItemTemplate = { question: "", options: ["", "", "", ""], correctAnswer: 0 }
    } else if (selectedTemplate.type === "fill_in_blank") {
      newItemTemplate = { text: "", answer: "" }
    } else if (selectedTemplate.type === "matching") {
      newItemTemplate = { left: "", right: "" }
    }

    setTemplateContent([...templateContent, newItemTemplate])
  }

  const handleUpdateItem = (index, field, value) => {
    const updatedContent = [...templateContent]

    if (field.includes(".")) {
      // Handle nested fields like options.0
      const [mainField, subField] = field.split(".")
      updatedContent[index][mainField][Number.parseInt(subField)] = value
    } else {
      updatedContent[index][field] = value
    }

    setTemplateContent(updatedContent)
  }

  const handleRemoveItem = (index) => {
    const updatedContent = [...templateContent]
    updatedContent.splice(index, 1)
    setTemplateContent(updatedContent)
  }

  const handleNextStep = () => {
    if (currentStep === 1 && studySetName.trim()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && selectedTemplate) {
      setCurrentStep(3)
    } else if (currentStep === 3 && templateContent.length > 0) {
      setCurrentStep(4)
    }
  }

  const handleBackStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const toggleMembers = () => {
    setShowMembers(!showMembers)
  }

  // Add handleDeleteCommunity function
  const handleDeleteCommunity = async () => {
    if (!window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      return
    }

    const token = sessionStorage.getItem("token")
    if (!token) {
      showNotification("You must be logged in to delete a community", "error")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      showNotification("Community deleted successfully", "success")
      navigate("/community") // Navigate back to communities list
    } catch (error) {
      console.error("Error deleting community:", error)
      showNotification("Failed to delete community", "error")
    }
  }

  // Modify the renderStudySetTags function to also include category and tag badges
  const renderStudySetTags = (studySet) => {
    const tags = []

    if (studySet.membersOnly) {
      tags.push(
          <span
              key="membersOnly"
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-1"
          >
          Members Only
        </span>,
      )
    }

    if (studySet.accessType === "specificMembers" && studySet.selectedMembers && studySet.selectedMembers.length > 0) {
      tags.push(
          <span
              key="specificMembers"
              className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 mr-1"
          >
          Selected Members
        </span>,
      )
    }

    // Add tag badges
    if (studySet.tags && studySet.tags.length > 0) {
      // studySet.tags.forEach((tag, index) => {
      //   tags.push(
      //       <span
      //           key={`tag-${index}`}
      //           className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10 mr-1"
      //       >
      //       {tag}
      //     </span>,
      //   )
      // })
    }

    return tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{tags}</div> : null
  }

  const handleCategorySelect = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4FDFF]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D6EF1]"></div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4FDFF]">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <p className="text-[#DC2626] text-[16px]">{error}</p>
          </div>
        </div>
    )
  }

  // Chat Room View
  if (showChatRoom) {
    return (
        <div className="min-h-screen flex bg-[#F4FDFF]">
          {/* Sidebar - Navigation */}
          <div
              className={`${isMobile ? "w-[45px]" : "w-[65px]"} bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]`}
          >
            {/* Navigation content */}
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${isMobile ? "ml-[45px]" : "ml-[65px]"} mr-0`}>
            {/* Back button without header bar */}
            <div className="h-16 flex items-center px-4">
              <button className="text-[#1D6EF1] mr-3 rounded-full p-1 hover:bg-[#F4FDFF]" onClick={handleBackToCommunity}>
                <ArrowLeft size={isMobile ? 16 : 20} />
              </button>
              <h1 className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20]`}>Chat Room</h1>
            </div>

            {/* Messages Container */}
            <div
                className={`flex-1 bg-white p-${isMobile ? "3" : "6"} mx-${isMobile ? "2" : "6"} mt-${isMobile ? "2" : "6"} mb-0 rounded-t-xl overflow-y-auto max-h-[calc(100vh-180px)]`}
            >
              {messages.length > 0 ? (
                  messages.map((message, index) => (
                      <div
                          key={message.id || `message-${index}`}
                          className={`mb-4 ${message.sender === "You" ? "text-right" : "text-center"}`}
                      >
                        <div
                            className={`inline-block p-${isMobile ? "2" : "3"} rounded-lg ${
                                message.sender === "You"
                                    ? "bg-[#1D6EF1] text-white"
                                    : message.sender === "System"
                                        ? "bg-[#97C7F1] text-white"
                                        : "bg-[#C5EDFD] text-[#1D1D20]"
                            }`}
                        >
                          <div className={`font-semibold mb-1 text-[${isMobile ? "12px" : "14px"}]`}>{message.sender}</div>
                          <div className={`text-[${isMobile ? "12px" : "14px"}]`}>{message.text}</div>
                          <div className={`text-[${isMobile ? "10px" : "12px"}] mt-1 opacity-70`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className={`text-center text-[#1D1D20]/70 text-[${isMobile ? "12px" : "14px"}]`}>
                    No messages yet. Start the conversation!
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
                className={`px-${isMobile ? "2" : "6"} py-${isMobile ? "2" : "4"} mx-${isMobile ? "2" : "6"} mb-${isMobile ? "2" : "6"} bg-white rounded-b-xl border-t border-[#E9D0CE]`}
            >
              <div className="flex">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className={`flex-1 p-${isMobile ? "2" : "3"} border border-[#E9D0CE] rounded-l-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                    className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white p-${isMobile ? "2" : "3"} rounded-r-xl flex items-center justify-center min-w-[${isMobile ? "80px" : "100px"}]`}
                    onClick={handleSendMessage}
                >
                  <Send size={isMobile ? 14 : 18} className="mr-2" />
                  <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Main Community View
  return (
      <div className="min-h-screen flex bg-[#F4FDFF]">
        {/* Left Sidebar - Navigation */}
        <div
            className={`${isMobile ? "w-[45px]" : "w-[65px]"} bg-white fixed left-0 top-0 bottom-0 overflow-y-auto border-r border-[#E9D0CE]`}
        >
          {/* Navigation content */}
        </div>

        {/* Main Content */}
        <div
            className={`flex-1 ${isMobile ? "ml-[45px]" : "ml-[65px]"} transition-all duration-300 ${showMembers ? (isMobile ? "mr-[200px]" : "mr-[260px]") : "mr-0"}`}
        >
          {/* Header */}
          {/* Study Sets Section with Action Buttons */}
          <div className={`mb-${isMobile ? "4" : "8"} px-${isMobile ? "2" : "6"} pt-${isMobile ? "2" : "6"}`}>
            <div
                className={`flex ${isMobile ? "flex-col" : "items-center"} justify-between mb-${isMobile ? "3" : "6"} ${isMobile ? "gap-2" : ""}`}
            >
              <div className={`flex ${isMobile ? "flex-wrap" : ""} items-center gap-${isMobile ? "2" : "4"}`}>
                <button
                    className="text-[#1D1D20] mr-3 flex items-center rounded-full p-2 hover:bg-[#F4FDFF]"
                    onClick={handleBack}
                >
                  <ArrowLeft size={isMobile ? 16 : 20} />
                </button>
                <h2 className={`${isMobile ? "text-[24px]" : "text-[32px]"} font-semibold text-[#1D1D20]`}>Study Sets</h2>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`bg-white rounded-xl p-${isMobile ? "1" : "2"} text-[#1D1D20] border border-[#E9D0CE] text-[${isMobile ? "12px" : "14px"}]`}
                >
                  <option value="all">View All</option>
                  <option value="flashcards">Flashcards</option>
                  <option value="fill_in_blank">Fill in the Blank</option>
                  <option value="matching">Matching</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              <div className={`flex ${isMobile ? "flex-wrap" : ""} gap-2 ${isMobile ? "mt-2" : ""}`}>
                <button
                    className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                    onClick={handleAddStudyMaterial}
                >
                  <Plus size={isMobile ? 14 : 18} className="mr-2" />
                  <span>{isMobile ? "Add" : "Add Study Material"}</span>
                </button>

                <button
                    className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                    onClick={handleOpenChatRoom}
                >
                  <MessageSquare size={isMobile ? 14 : 18} className="mr-2" />
                  <span>Message</span>
                </button>

                <button
                    className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                    onClick={toggleMembers}
                >
                  <Users size={isMobile ? 14 : 18} className="mr-2" />
                  <span>Members</span>
                </button>

                <button
                    className={`bg-[#DC2626] hover:bg-[#DC2626]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "2" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}] flex items-center`}
                    onClick={handleDeleteCommunity}
                >
                  <Trash2 size={isMobile ? 14 : 18} className="mr-2" />
                  <span>Delete Community</span>
                </button>
              </div>
            </div>

            {/* Study Sets Section */}
            {studySets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 w-full">
                  {studySets
                      .filter((set) => selectedType === "all" || set.type === selectedType)
                      .map((studySet) => (
                          <div
                              key={studySet.id}
                              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                                  studySet.matchesUserInterests ? "border-l-4 border-[#1D6EF1]" : ""
                              }`}
                          >
                            <div className={`p-${isMobile ? "3" : "5"}`}>
                              <div className="flex items-start">
                                <div
                                    className={`${
                                        studySet.matchesUserInterests ? "bg-[#1D6EF1]" : "bg-[#1D6EF1]"
                                    } rounded-full w-${isMobile ? "10" : "12"} h-${isMobile ? "10" : "12"} flex items-center justify-center text-white mr-${isMobile ? "2" : "4"} flex-shrink-0 overflow-hidden`}
                                >
                                  {/* --- Conditional Avatar --- */}
                                  {shouldShowPics && studySet.creatorPicture ? (
                                    <img
                                      src={studySet.creatorPicture}
                                      alt={studySet.title.charAt(0)}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loops
                                        e.target.style.display = 'none'; // Hide broken image
                                        // Find the parent div and replace img with initial
                                        const avatarContainer = e.target.parentNode;
                                        if (avatarContainer) {
                                            avatarContainer.innerHTML = `<span class="font-semibold">${studySet.creatorEmail ? studySet.creatorEmail.charAt(0).toUpperCase() : "?"}</span>`;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span className="font-semibold">{studySet.creatorEmail ? studySet.creatorEmail.charAt(0).toUpperCase() : "?"}</span>
                                  )}
                                  {/* --- End Conditional Avatar --- */}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 flex items-center">
                                      <h2
                                          className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20] cursor-pointer truncate`}
                                          onClick={() => handleViewStudySet(studySet)}
                                      >
                                        {studySet.title}
                                        {studySet.matchesUserInterests && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Matches your interests
                                  </span>
                                        )}
                                      </h2>
                                      <p
                                          className={`${isMobile ? "text-[12px]" : "text-[14px]"} text-[#1D1D20]/70 truncate text-left w-full`}
                                      >
                                        {studySet.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                              <span
                                  className={`${isMobile ? "text-[12px]" : "text-[14px]"} bg-[#1D1D20] px-${isMobile ? "2" : "3"} py-1 rounded-xl h-8 flex items-center`}
                              >
                                {formatStudySetType(studySet.type)}
                              </span>
                                      {studySet.categories &&
                                          studySet.categories.slice(0, 3).map((category, idx) => (
                                              <div key={`cat-${idx}`} className="relative group">
                                    <span
                                        className={`text-[14px] ${
                                            userCategories.includes(category)
                                                ? "bg-[#48BB78] text-white"
                                                : "bg-[#1D6EF1] text-[#F4FDFF]"
                                        } px-3 py-1 rounded-xl flex items-center h-8 cursor-pointer`}
                                    >
                                      {category}
                                      {userCategories.includes(category) && <span className="ml-1 text-xs">★</span>}
                                    </span>

                                                {/* Tags that appear on hover - fixed positioning */}
                                                {studySet.tags && studySet.tags.length > 0 && (
                                                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-max bg-white shadow-lg rounded-lg p-3 hidden group-hover:block z-20 max-w-[250px] max-h-[200px] overflow-y-auto">
                                                      <div className="flex flex-wrap gap-2 justify-center">
                                                        {studySet.tags
                                                            .filter((tag) => school_categories[category]?.includes(tag))
                                                            .map((tag, tagIdx) => (
                                                                <span
                                                                    key={`hover-tag-${tagIdx}`}
                                                                    className="text-[14px] bg-[#1D6EF1] text-[#F4FDFF] px-3 py-1.5 rounded-xl whitespace-nowrap font-medium"
                                                                >
                                                {tag}
                                              </span>
                                                            ))}
                                                        {studySet.tags.filter((tag) => school_categories[category]?.includes(tag))
                                                            .length === 0 && (
                                                            <span className="text-[14px] text-gray-500">No tags for this category</span>
                                                        )}
                                                      </div>
                                                    </div>
                                                )}
                                              </div>
                                          ))}
                                    </div>
                                  </div>

                                  {/* Render tags */}
                                  {renderStudySetTags(studySet)}

                                  <div
                                      className={`flex ${isMobile ? "flex-col" : "justify-between"} items-${isMobile ? "start" : "center"} mt-3 ${isMobile ? "gap-2" : ""}`}
                                  >
                                    <div className={`flex items-center ${isMobile ? "flex-wrap gap-1" : ""}`}>
                                      <button
                                          className={`bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-1 px-${isMobile ? "2" : "3"} rounded-xl mr-2 flex items-center`}
                                          onClick={() => handleShareStudySet(studySet.id)}
                                      >
                                        {copiedSetId === studySet.id ? (
                                            <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Copied!</span>
                                        ) : (
                                            <>
                                              <Share2 size={isMobile ? 14 : 16} className="mr-1" />
                                              <span className={`text-[${isMobile ? "12px" : "14px"}]`}>Share</span>
                                            </>
                                        )}
                                      </button>
                                      <button
                                          className="bg-black text-white py-1 px-3 rounded-xl flex items-center"
                                          onClick={() => handleDeleteStudySet(studySet.id, studySet.creator)}
                                      >
                                        <span className="text-[14px]">Delete</span>
                                      </button>
                                    </div>
                                    <div className={`flex-shrink-0 ${isMobile ? "" : "ml-4"}`}>
                                      <p className={`text-[${isMobile ? "12px" : "14px"}] font-semibold text-left`}>You</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                      ))}
                </div>
            ) : (
                <div className={`text-center py-${isMobile ? "4" : "8"} bg-white/80 rounded-xl`}>
                  <p className={`text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]/70`}>No study sets available.</p>
                </div>
            )}
          </div>
        </div>

        {/* Members Sidebar - Only shown when toggled */}
        {showMembers && (
            <div
                className={`${isMobile ? "w-[200px]" : "w-[260px]"} bg-white fixed right-0 top-0 bottom-0 overflow-y-auto shadow-lg border-l border-[#E9D0CE] transition-all duration-300 rounded-l-xl`}
            >
              <div className={`p-${isMobile ? "3" : "6"}`}>
                <div className={`flex items-center justify-between mb-${isMobile ? "3" : "6"}`}>
                  <h2 className={`${isMobile ? "text-[20px]" : "text-[26px]"} font-semibold text-[#1D1D20]`}>Members</h2>
                  <div className="flex items-center gap-2">
                    <button
                        className="text-[#1D1D20] hover:text-[#1D1D20]/70 p-1 rounded-full"
                        onClick={toggleMembers}
                        aria-label="Close members panel"
                    >
                      <X size={isMobile ? 16 : 20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {members.length > 0 ? (
                      members.map((member, index) => (
                          <div
                              key={member.id || `member-${index}`}
                              className={`flex items-center justify-between p-${isMobile ? "1" : "2"} rounded-xl hover:bg-[#F4FDFF]`}
                          >
                            <div className="flex items-center">
                              <div
                                  className={`bg-[#1D6EF1] rounded-full w-${isMobile ? "6" : "8"} h-${isMobile ? "6" : "8"} flex items-center justify-center text-white mr-2 overflow-hidden`}
                              >
                                {/* --- Conditional Member Avatar --- */}
                                {shouldShowPics && member.picture ? (
                                  <img
                                    src={member.picture}
                                    alt={member.email ? member.email[0].toUpperCase() : "?"}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.onerror = null; // prevent infinite loops
                                      e.target.style.display = 'none'; // hide broken image
                                      // Find the parent div and replace img with initial
                                      const avatarContainer = e.target.parentNode;
                                      if (avatarContainer) {
                                        avatarContainer.innerHTML = `<span>${member.email ? member.email[0].toUpperCase() : "?"}</span>`;
                                      }
                                    }}
                                  />
                                ) : (
                                <span>{member.email ? member.email[0].toUpperCase() : "?"}</span>
                                )}
                                {/* --- End Conditional Member Avatar --- */}
                              </div>
                              <span className={`text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20] truncate max-w-[160px]`}>
                        {member.email}
                      </span>
                            </div>
                            {member.isAdmin && (
                                <span
                                    className={`text-[${isMobile ? "12px" : "14px"}] bg-[#97C7F1] px-2 py-1 rounded-xl text-white`}
                                >
                        Admin
                      </span>
                            )}
                          </div>
                      ))
                  ) : (
                      <p className={`text-[${isMobile ? "12px" : "14px"}] text-[#1D1D20]/70`}>No members yet.</p>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Add Study Set Dialog */}
        {showAddStudySetDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-4 md:p-6 max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto mx-auto my-auto">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-[#1D1D20]">
                      {currentStep === 1
                          ? "Name Your Study Set"
                          : currentStep === 2
                              ? "Select a Template"
                              : currentStep === 3
                                  ? "Customize Your Content"
                                  : "Add Categories & Tags"}
                    </h2>
                    <button
                        className="text-[#1D1D20] hover:text-[#1D1D20]/70 p-2 rounded-full"
                        onClick={() => {
                          setShowAddStudySetDialog(false)
                          setCurrentStep(1)
                          setStudySetName("")
                          setSelectedTemplate(null)
                          setTemplateContent([])
                          setSelectedCategories([])
                          setSelectedTags([])
                        }}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Step indicators */}
                  <div className="flex mb-4 md:mb-6 rounded-xl overflow-hidden">
                    <div
                        className={`flex-1 p-2 text-center ${currentStep === 1 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                    >
                      1. Name
                    </div>
                    <div
                        className={`flex-1 p-2 text-center ${currentStep === 2 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                    >
                      2. Template
                    </div>
                    <div
                        className={`flex-1 p-2 text-center ${currentStep === 3 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                    >
                      3. Content
                    </div>
                    <div
                        className={`flex-1 p-2 text-center ${currentStep === 4 ? "bg-[#1D6EF1] text-white" : "bg-[#F4FDFF]"}`}
                    >
                      4. Tags
                    </div>
                  </div>

                  {/* Step 1: Name */}
                  {currentStep === 1 && (
                      <Box sx={{ p: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "SourGummy, sans-serif",
                              mb: 2,
                            }}
                        >
                          Study Set Name
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter a name for your study set"
                            value={studySetName}
                            onChange={(e) => setStudySetName(e.target.value)}
                            sx={{
                              mb: 3,
                              "& .MuiOutlinedInput-root": {
                                fontFamily: "SourGummy, sans-serif",
                              },
                            }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "SourGummy, sans-serif",
                              mb: 2,
                            }}
                        >
                          Template Type
                        </Typography>

                        <Grid container spacing={2}>
                          {templateOptions.map((template) => (
                              <Grid item xs={6} sm={4} key={template.id}>
                                <Card
                                    sx={{
                                      cursor: "pointer",
                                      bgcolor: selectedTemplateId === template.id ? "#E8F4F9" : "white",
                                      border: selectedTemplateId === template.id ? "2px solid #1D6EF1" : "1px solid #e0e0e0",
                                      transition: "all 0.2s ease-in-out",
                                      height: "100%",
                                      "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                      },
                                    }}
                                    onClick={() => handleTemplateChange(template)}
                                >
                                  <CardContent>
                                    <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          p: 1,
                                        }}
                                    >
                                      <template.icon
                                          size={36}
                                          color={selectedTemplateId === template.id ? "#1D6EF1" : "#64748B"}
                                      />
                                      <Typography
                                          variant="subtitle1"
                                          sx={{
                                            fontFamily: "SourGummy, sans-serif",
                                            textAlign: "center",
                                            mt: 1,
                                            color: selectedTemplateId === template.id ? "#1D6EF1" : "#1D1D20",
                                          }}
                                      >
                                        {template.name}
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                          ))}
                        </Grid>

                        <Typography
                            variant="h6"
                            sx={{
                              fontFamily: "SourGummy, sans-serif",
                              mb: 2,
                              mt: 4,
                            }}
                        >
                          Access Control
                        </Typography>

                        <FormControl component="fieldset" sx={{ width: "100%" }}>
                          <Typography sx={{ fontFamily: "SourGummy, sans-serif", mb: 1, fontSize: "14px" }}>
                            Who can view this study set?
                          </Typography>
                          <Grid container direction="column" spacing={1}>
                            <Grid item>
                              <FormControlLabel
                                  value="everyone"
                                  control={
                                    <Switch
                                        checked={accessType === "everyone"}
                                        onChange={() => {
                                          setAccessType("everyone")
                                          setMembersOnly(false)
                                          setSelectedMembers([])
                                        }}
                                        color="primary"
                                    />
                                  }
                                  label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Unlock size={16} />
                                      <Typography sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                        Everyone - Study set visible to all users
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{
                                    "& .MuiFormControlLabel-label": {
                                      fontFamily: "SourGummy, sans-serif",
                                    },
                                  }}
                              />
                            </Grid>

                            <Grid item>
                              <FormControlLabel
                                  value="allMembers"
                                  control={
                                    <Switch
                                        checked={accessType === "allMembers"}
                                        onChange={() => {
                                          setAccessType("allMembers")
                                          setMembersOnly(true)
                                          setSelectedMembers([])
                                        }}
                                        color="primary"
                                    />
                                  }
                                  label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Lock size={16} />
                                      <Typography sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                        Community Members Only - Only visible to anyone who joined the community
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{
                                    "& .MuiFormControlLabel-label": {
                                      fontFamily: "SourGummy, sans-serif",
                                    },
                                  }}
                              />
                            </Grid>

                            <Grid item>
                              <FormControlLabel
                                  value="specificMembers"
                                  control={
                                    <Switch
                                        checked={accessType === "specificMembers"}
                                        onChange={() => {
                                          setAccessType("specificMembers")
                                          setMembersOnly(true)
                                        }}
                                        color="primary"
                                    />
                                  }
                                  label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <Users size={16} />
                                      <Typography sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                        Specific Members - Choose exactly who can see this study set
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{
                                    "& .MuiFormControlLabel-label": {
                                      fontFamily: "SourGummy, sans-serif",
                                    },
                                  }}
                              />
                            </Grid>
                          </Grid>
                        </FormControl>

                        {/* Show member selection when specific members option is chosen */}
                        {accessType === "specificMembers" && (
                            <FormControl fullWidth sx={{ mt: 2 }}>
                              <InputLabel id="member-selection-label" sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                Select Members
                              </InputLabel>
                              <Select
                                  labelId="member-selection-label"
                                  id="member-selection"
                                  multiple
                                  value={selectedMembers}
                                  onChange={(e) => setSelectedMembers(e.target.value)}
                                  input={<OutlinedInput label="Select Members" />}
                                  renderValue={(selected) => (
                                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((value) => {
                                          const member = members.find((m) => m.userID === value)
                                          return (
                                              <Chip
                                                  key={value}
                                                  label={member ? member.email : value}
                                                  sx={{ fontFamily: "SourGummy, sans-serif" }}
                                              />
                                          )
                                        })}
                                      </Box>
                                  )}
                                  MenuProps={{
                                    PaperProps: {
                                      style: {
                                        maxHeight: 224,
                                        width: 250,
                                      },
                                    },
                                    anchorOrigin: {
                                      vertical: "bottom",
                                      horizontal: "left",
                                    },
                                  }}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      fontFamily: "SourGummy, sans-serif",
                                    },
                                    "& .MuiInputLabel-root": {
                                      fontFamily: "SourGummy, sans-serif",
                                    },
                                  }}
                              >
                                {members.length > 0 ? (
                                    members.map((member) => (
                                        <MenuItem key={member.userID} value={member.userID}>
                                          <Checkbox checked={selectedMembers.includes(member.userID)} />
                                          <ListItemText
                                              primary={
                                                <Typography sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                                  {member.email} {member.isAdmin ? " (Admin)" : ""}
                                                </Typography>
                                              }
                                          />
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>
                                      <Typography sx={{ fontFamily: "SourGummy, sans-serif" }}>
                                        No members found in this community
                                      </Typography>
                                    </MenuItem>
                                )}
                              </Select>
                              <Typography
                                  variant="caption"
                                  sx={{ mt: 1, fontFamily: "SourGummy, sans-serif", display: "block" }}
                              >
                                Only selected members will be able to view this study set
                              </Typography>
                            </FormControl>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                          <Button
                              variant="contained"
                              onClick={() => setCurrentStep(2)}
                              disabled={!studySetName.trim() || !selectedTemplateId}
                              sx={{
                                bgcolor: "#1D6EF1",
                                "&:hover": {
                                  bgcolor: "#1557B0",
                                },
                                fontFamily: "SourGummy, sans-serif",
                              }}
                          >
                            Choose Template
                          </Button>
                        </Box>
                      </Box>
                  )}

                  {/* Step 2: Template Selection */}
                  {currentStep === 2 && (
                      <div>
                        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-4 mb-6`}>
                          {[
                            {
                              id: 1,
                              name: "Basic Flashcards",
                              type: "flashcards",
                              icon: BookOpen,
                              content: [{ front: "", back: "" }],
                            },
                            {
                              id: 2,
                              name: "Multiple Choice Quiz",
                              type: "multiple_choice",
                              icon: FileText,
                              content: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
                            },
                            {
                              id: 3,
                              name: "Fill in the Blank",
                              type: "fill_in_blank",
                              icon: FileText,
                              content: [{ text: "", answer: "" }],
                            },
                            {
                              id: 4,
                              name: "Matching Exercise",
                              type: "matching",
                              icon: FileText,
                              content: [{ left: "", right: "" }],
                            },
                          ].map((template) => (
                              <div
                                  key={template.id}
                                  className={`border rounded-xl p-${isMobile ? "3" : "4"} cursor-pointer hover:bg-[#F4FDFF] ${
                                      selectedTemplate?.id === template.id ? "border-[#1D6EF1] bg-[#F4FDFF]" : ""
                                  }`}
                                  onClick={() => handleTemplateSelect(template)}
                              >
                                <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold mb-2 text-[#1D1D20]`}>
                                  {template.name}
                                </h3>
                                <p className={`text-[${isMobile ? "12px" : "14px"}] text-[#1D1D20]/70`}>
                                  Type: {formatStudySetType(template.type)}
                                </p>
                              </div>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <button
                              className={`bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={handleBackStep}
                          >
                            Back
                          </button>
                          <button
                              className={`bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={() => setCurrentStep(3)}
                              disabled={!selectedTemplate}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Step 3: Content Customization */}
                  {currentStep === 3 && (
                      <div>
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold text-[#1D1D20]`}>
                              {selectedTemplate.name} Content
                            </h3>
                            <button
                                className={`bg-[#1D1D20] hover:bg-[#1D6EF1]/90 text-white py-1 px-${isMobile ? "2" : "3"} rounded-xl text-[${isMobile ? "12px" : "14px"}] flex items-center`}
                                onClick={handleAddItem}
                            >
                              <Plus size={isMobile ? 14 : 16} className="mr-1" />
                              Add Item
                            </button>
                          </div>

                          {/* Flashcards Editor */}
                          {selectedTemplate.type === "flashcards" && (
                              <div className="space-y-4">
                                {templateContent.map((item, index) => (
                                    <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                                      <div className="flex justify-between items-center mb-2">
                                        <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                          Card {index + 1}
                                        </h4>
                                        <button
                                            className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={templateContent.length <= 1}
                                        >
                                          <Trash2 size={isMobile ? 14 : 16} />
                                        </button>
                                      </div>
                                      <div className="mb-3">
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Front (Question)
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                            value={item.front}
                                            onChange={(e) => handleUpdateItem(index, "front", e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Back (Answer)
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                            value={item.back}
                                            onChange={(e) => handleUpdateItem(index, "back", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}

                          {/* Multiple Choice Editor */}
                          {selectedTemplate.type === "multiple_choice" && (
                              <div className="space-y-4">
                                {templateContent.map((item, index) => (
                                    <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                                      <div className="flex justify-between items-center mb-2">
                                        <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                          Question {index + 1}
                                        </h4>
                                        <button
                                            className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={templateContent.length <= 1}
                                        >
                                          <Trash2 size={isMobile ? 14 : 16} />
                                        </button>
                                      </div>
                                      <div className="mb-3">
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Question
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                            value={item.question}
                                            onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                                        />
                                      </div>
                                      <div className="mb-3">
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Options
                                        </label>
                                        {item.options.map((option, optIndex) => (
                                            <div key={optIndex} className="flex items-center mb-2">
                                              <input
                                                  type="radio"
                                                  name={`correct-${index}`}
                                                  checked={item.correctAnswer === optIndex}
                                                  onChange={() => handleUpdateItem(index, "correctAnswer", optIndex)}
                                                  className="mr-2"
                                              />
                                              <input
                                                  type="text"
                                                  className={`flex-1 p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                                  value={option}
                                                  onChange={(e) => handleUpdateItem(index, `options.${optIndex}`, e.target.value)}
                                                  placeholder={`Option ${optIndex + 1}`}
                                              />
                                            </div>
                                        ))}
                                        <p className={`text-[${isMobile ? "10px" : "12px"}] text-[#1D1D20]/70`}>
                                          Select the radio button next to the correct answer
                                        </p>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}

                          {/* Fill in the Blank Editor */}
                          {selectedTemplate.type === "fill_in_blank" && (
                              <div className="space-y-4">
                                {templateContent.map((item, index) => (
                                    <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                                      <div className="flex justify-between items-center mb-2">
                                        <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                          Sentence {index + 1}
                                        </h4>
                                        <button
                                            className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={templateContent.length <= 1}
                                        >
                                          <Trash2 size={isMobile ? 14 : 16} />
                                        </button>
                                      </div>
                                      <div className="mb-3">
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Text (use ___ for the blank)
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                            value={item.text}
                                            onChange={(e) => handleUpdateItem(index, "text", e.target.value)}
                                            placeholder="Example: The sky is ___."
                                        />
                                      </div>
                                      <div>
                                        <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                          Answer
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                            value={item.answer}
                                            onChange={(e) => handleUpdateItem(index, "answer", e.target.value)}
                                        />
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}

                          {/* Matching Editor */}
                          {selectedTemplate.type === "matching" && (
                              <div className="space-y-4">
                                {templateContent.map((item, index) => (
                                    <div key={index} className={`border border-[#E9D0CE] rounded-xl p-${isMobile ? "3" : "4"}`}>
                                      <div className="flex justify-between items-center mb-2">
                                        <h4 className={`font-medium text-[${isMobile ? "14px" : "16px"}] text-[#1D1D20]`}>
                                          Pair {index + 1}
                                        </h4>
                                        <button
                                            className="text-[#DC2626] rounded-full p-1 hover:bg-[#F4FDFF]"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={templateContent.length <= 1}
                                        >
                                          <Trash2 size={isMobile ? 14 : 16} />
                                        </button>
                                      </div>
                                      <div className={`grid grid-cols-${isMobile ? "1" : "2"} gap-4`}>
                                        <div>
                                          <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                            Left Item
                                          </label>
                                          <input
                                              type="text"
                                              className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                              value={item.left}
                                              onChange={(e) => handleUpdateItem(index, "left", e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <label className={`block text-[#1D1D20] mb-1 text-[${isMobile ? "12px" : "14px"}]`}>
                                            Right Item
                                          </label>
                                          <input
                                              type="text"
                                              className={`w-full p-${isMobile ? "1.5" : "2"} border border-[#E9D0CE] rounded-xl text-[#1D1D20] text-[${isMobile ? "12px" : "14px"}]`}
                                              value={item.right}
                                              onChange={(e) => handleUpdateItem(index, "right", e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                              className={`bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={handleBackStep}
                          >
                            Back
                          </button>
                          <button
                              className={`bg-[#48BB78] hover:bg-[#48BB78]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={() => setCurrentStep(4)}
                              disabled={templateContent.length === 0}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                  )}

                  {/* Step 4: Categories & Tags */}
                  {currentStep === 4 && (
                      <div>
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-[${isMobile ? "14px" : "16px"}] font-semibold text-[#1D1D20]`}>Add Tags</h3>
                          </div>

                          <div className="max-h-[50vh] overflow-y-auto">
                            <TagSelector
                                selectedCategories={selectedCategories}
                                setSelectedCategories={setSelectedCategories}
                                selectedTags={selectedTags}
                                setSelectedTags={setSelectedTags}
                                school_categories={school_categories}
                                isMobile={isMobile}
                                embedded={true}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                              className={`bg-[#F4FDFF] hover:bg-[#F4FDFF]/90 text-[#1D1D20] py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={handleBackStep}
                          >
                            Back
                          </button>
                          <button
                              className={`bg-[#1D6EF1] hover:bg-[#1D6EF1]/90 text-white py-${isMobile ? "1" : "2"} px-${isMobile ? "3" : "4"} rounded-xl text-[${isMobile ? "14px" : "16px"}]`}
                              onClick={createStudySet}
                          >
                            Create Study Set
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Notification Component */}
        {notification.show && (
            <div
                className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
                    notification.type === "success"
                        ? "bg-green-500"
                        : notification.type === "info"
                            ? "bg-blue-500"
                            : "bg-red-500"
                } text-white z-50`}
            >
              {notification.message}
            </div>
        )}
      </div>
  )
}