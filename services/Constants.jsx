import { BriefcaseBusinessIcon, Code2Icon, User2Icon, Component, Puzzle, Calendar, LayoutDashboard, List, Settings, WalletCards, LogOutIcon, Video } from "lucide-react";

export const SideBarOptions=[
    {
        name:'Dashboard',
        icon:LayoutDashboard,
        path:'/recruiter/dashboard'
    },
    {
        name:'Scheduled Interview',
        icon:Calendar,
        path:'/recruiter/scheduled-interview'
    },
    {
        name:'All Interview',
        icon:List,
        path:'/recruiter/all-interview'
    },
    {
        name:'Profile',
        icon:User2Icon,
        path:'/recruiter/profile'
    },
    {
        name:'Billing',
        icon:WalletCards,
        path:'/recruiter/billing'
    },
   
   
]

export const SideBarCondidate=[
    {
        name:'Dashboard',
        icon:LayoutDashboard,
        path:'/candidate/dashboard'
    },
    {
        name:'Interviews',
        icon:Video,
        path:'/candidate/interviews'
    },
    {
        name:'Profile',
        icon:User2Icon,
        path:'/candidate/profile'
    },
   
   
]

export const InterviewType=[
    {
        name:'Technical',
        icon:Code2Icon,
    },
    {
        name:'Behavioral',
        icon:User2Icon,
    },
    {
        name:'Experience',
        icon:BriefcaseBusinessIcon,
    },
    {
        name:'Problem Solving',
        icon:Puzzle,
    },
    {
        name:'Leadership',
        icon:Component,
    },
]

export const QUESTIONS_PROMPT = `
You are an expert technical interviewer.

Job Title: {{jobPosition}}
Job Description: {{jobDescription}}
Interview Duration: {{duration}}
Interview Type: {{type}}

Task:
Generate interview questions based on job description and duration.

Include:
- Candidate introduction
- Technical questions
- Experience questions
- Problem solving
- Salary discussion
- Closing question

Adjust number of questions based on duration.

IMPORTANT:
Return ONLY valid JSON.
Do not write explanation.
Do not write text outside JSON.

Use this format strictly:

{
  "interviewQuestions": [
    {
      "question": "",
      "type": ""
    }
  ]
}
`;
export const FEEDBACK_PROMPT=`{{conversation}}

Depends on this Interview Conversation between assitant and user, 

Give me feedback for user interview. Give me rating out of 10 for technical Skills, 

Communication, Problem Solving, Experience. Also give me summery in 3 lines 

about the interview and one line to let me know whether is recommended 

for hire or not with message very strictly. Give me response in JSON format

{

    feedback:{

        rating:{

            TechnicalSkills:5,

            Communication:6,

            ProblemSolving:4,

            Experience:7,

            Behavioral:8,

            Analysis:9



        },

        summery:<in 3 Line>,

        Recommendation:'',

        Recommendation Message:''



    }

}

`