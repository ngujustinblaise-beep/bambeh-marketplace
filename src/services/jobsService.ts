/**
 * JOBS SERVICE - Mock Data with LocalStorage
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  description: string;
  requirements: string[];
  salary: { min: number; max: number; currency: string };
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship";
  category: string;
  postedAt: string;
  expiresAt: string;
  status: "active" | "closed" | "expired";
  applicants: number;
}

const MOCK_JOBS: Job[] = [
  {
    id: "1", title: "Senior Software Engineer", company: "TechCorp Cameroon",
    companyLogo: "https://via.placeholder.com/100",
    description: "We are looking for an experienced software engineer to join our growing team.",
    requirements: ["5+ years of experience in software development", "Strong knowledge of React, TypeScript, Node.js", "Experience with cloud platforms (AWS, Azure)", "Excellent problem-solving skills"],
    salary: { min: 800000, max: 1500000, currency: "XAF" },
    location: "Yaoundé, Centre", type: "full-time", category: "Technology",
    postedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", applicants: 23,
  },
  {
    id: "2", title: "Marketing Manager", company: "Growth Agency",
    description: "Lead our marketing efforts and drive business growth.",
    requirements: ["3+ years in marketing", "Digital marketing expertise", "Team management experience"],
    salary: { min: 600000, max: 1000000, currency: "XAF" },
    location: "Douala, Littoral", type: "full-time", category: "Marketing",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", applicants: 45,
  },
  {
    id: "3", title: "Graphic Designer", company: "Creative Studio",
    description: "Create stunning visuals for our clients.",
    requirements: ["Adobe Creative Suite mastery", "Portfolio required", "2+ years experience"],
    salary: { min: 300000, max: 600000, currency: "XAF" },
    location: "Yaoundé, Centre", type: "contract", category: "Design",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", applicants: 34,
  },
  {
    id: "4", title: "Sales Representative", company: "Retail Solutions",
    description: "Drive sales and build customer relationships.",
    requirements: ["Excellent communication skills", "Sales experience preferred", "French and English fluency"],
    salary: { min: 250000, max: 500000, currency: "XAF" },
    location: "Douala, Littoral", type: "full-time", category: "Sales",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", applicants: 67,
  },
  {
    id: "5", title: "Data Analyst Intern", company: "Analytics Inc",
    description: "Learn data analysis in a professional environment.",
    requirements: ["Statistics or Computer Science student", "Python basics", "Eager to learn"],
    salary: { min: 100000, max: 200000, currency: "XAF" },
    location: "Yaoundé, Centre", type: "internship", category: "Technology",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active", applicants: 89,
  },
];

class JobsService {
  private storageKey = "bambeh_jobs";

  private initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(MOCK_JOBS));
    }
  }

  getAllJobs(): Promise<Job[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const jobs = data ? JSON.parse(data) : MOCK_JOBS;
        const activeJobs = jobs.filter((job: Job) => {
          const now = new Date();
          const expiresAt = new Date(job.expiresAt);
          return expiresAt > now && job.status === "active";
        });
        resolve(activeJobs);
      }, 500);
    });
  }

  getJobById(id: string): Promise<Job | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const jobs = data ? JSON.parse(data) : MOCK_JOBS;
        const job = jobs.find((j: Job) => j.id === id);
        resolve(job || null);
      }, 300);
    });
  }

  addJob(job: Omit<Job, "id" | "postedAt" | "expiresAt" | "applicants">): Promise<Job> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initializeData();
        const data = localStorage.getItem(this.storageKey);
        const jobs = data ? JSON.parse(data) : [];
        const newJob: Job = {
          ...job,
          id: Date.now().toString(),
          postedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          applicants: 0,
        };
        jobs.push(newJob);
        localStorage.setItem(this.storageKey, JSON.stringify(jobs));
        resolve(newJob);
      }, 500);
    });
  }

  searchJobs(query: string): Promise<Job[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.getAllJobs().then((jobs) => {
          const filtered = jobs.filter(
            (job) =>
              job.title.toLowerCase().includes(query.toLowerCase()) ||
              job.company.toLowerCase().includes(query.toLowerCase()) ||
              job.category.toLowerCase().includes(query.toLowerCase()),
          );
          resolve(filtered);
        });
      }, 300);
    });
  }
}

export const jobsService = new JobsService();
