import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SuccessStories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const successStories = [
    {
      id: 1,
      name: "Priya Sharma",
      category: "engineering",
      scholarship: "Merit Scholarship for Engineering Excellence",
      amount: "₹2,50,000",
      university: "IIT Delhi",
      field: "Computer Science Engineering",
      story: "Coming from a small village in Rajasthan, I never thought I could afford quality education. This scholarship not only covered my tuition but also gave me the confidence to pursue my dreams. Today, I'm working as a software engineer at a leading tech company.",
      before: "Struggling to afford engineering education",
      after: "Successfully graduated and employed at top tech company",
      image: "👩‍💻",
      year: "2023",
      location: "Rajasthan"
    },
    {
      id: 2,
      name: "Rahul Kumar",
      category: "medical",
      scholarship: "Medical Education Support for SC/ST Students",
      amount: "₹5,00,000",
      university: "AIIMS Delhi",
      field: "MBBS",
      story: "As a first-generation learner from a tribal community, medical education seemed impossible. This scholarship changed everything. I'm now in my final year of MBBS and planning to serve in rural areas to give back to my community.",
      before: "First-generation student with limited resources",
      after: "Final year MBBS student at AIIMS",
      image: "👨‍⚕️",
      year: "2022",
      location: "Jharkhand"
    },
    {
      id: 3,
      name: "Anjali Patel",
      category: "arts",
      scholarship: "Creative Arts Excellence Award",
      amount: "₹1,50,000",
      university: "National Institute of Design",
      field: "Graphic Design",
      story: "My passion for design was always there, but financial constraints were holding me back. This scholarship allowed me to pursue my creative dreams. I've now started my own design studio and work with international clients.",
      before: "Unable to afford design education",
      after: "Successful entrepreneur with own design studio",
      image: "🎨",
      year: "2023",
      location: "Gujarat"
    },
    {
      id: 4,
      name: "Amit Singh",
      category: "research",
      scholarship: "PhD Research Fellowship in Renewable Energy",
      amount: "₹8,00,000",
      university: "IISc Bangalore",
      field: "Mechanical Engineering",
      story: "Research in renewable energy was my dream, but PhD programs are expensive. This fellowship not only funded my research but also connected me with leading scientists. I'm now developing solar energy solutions for rural India.",
      before: "Unable to pursue PhD due to financial constraints",
      after: "Leading renewable energy researcher",
      image: "🔬",
      year: "2021",
      location: "Uttar Pradesh"
    },
    {
      id: 5,
      name: "Sneha Reddy",
      category: "business",
      scholarship: "Women in Business Leadership Program",
      amount: "₹3,00,000",
      university: "IIM Bangalore",
      field: "MBA",
      story: "As a woman from a conservative family, pursuing an MBA seemed impossible. This scholarship empowered me to break barriers. I'm now a senior manager at a multinational company and mentor other women in business.",
      before: "Facing cultural and financial barriers",
      after: "Senior manager at multinational company",
      image: "👩‍💼",
      year: "2022",
      location: "Telangana"
    },
    {
      id: 6,
      name: "Vikram Malhotra",
      category: "sports",
      scholarship: "Sports Excellence Scholarship",
      amount: "₹2,00,000",
      university: "Sports Authority of India",
      field: "Athletics",
      story: "I was a promising athlete but couldn't afford proper training and equipment. This scholarship provided everything I needed. I've won several national championships and represented India in international competitions.",
      before: "Talented athlete without resources",
      after: "National champion and international athlete",
      image: "🏃‍♂️",
      year: "2023",
      location: "Haryana"
    },
    {
      id: 7,
      name: "Fatima Khan",
      category: "humanities",
      scholarship: "Social Sciences Research Grant",
      amount: "₹1,80,000",
      university: "JNU Delhi",
      field: "Sociology",
      story: "Coming from a minority community, I wanted to study social issues affecting marginalized groups. This scholarship allowed me to conduct meaningful research. I'm now working with NGOs to create positive social change.",
      before: "Passionate about social issues but limited opportunities",
      after: "Social researcher working for community development",
      image: "📚",
      year: "2022",
      location: "Delhi"
    },
    {
      id: 8,
      name: "Rajesh Verma",
      category: "agriculture",
      scholarship: "Agricultural Innovation Fellowship",
      amount: "₹4,00,000",
      university: "ICAR",
      field: "Agricultural Sciences",
      story: "As a farmer's son, I wanted to improve agricultural practices in my village. This fellowship helped me study modern farming techniques. I've now implemented sustainable farming methods that have increased crop yields by 40%.",
      before: "Traditional farming methods with low yields",
      after: "Agricultural innovator improving farming practices",
      image: "🌾",
      year: "2023",
      location: "Madhya Pradesh"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Stories', icon: '📖' },
    { id: 'engineering', name: 'Engineering', icon: '⚙️' },
    { id: 'medical', name: 'Medical', icon: '🏥' },
    { id: 'arts', name: 'Arts & Design', icon: '🎨' },
    { id: 'research', name: 'Research', icon: '🔬' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'sports', name: 'Sports', icon: '🏃‍♂️' },
    { id: 'humanities', name: 'Humanities', icon: '📚' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' }
  ];

  const filteredStories = selectedCategory === 'all' 
    ? successStories 
    : successStories.filter(story => story.category === selectedCategory);

  return (
    <div className="container-fluid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card mb-4"
      >
        <div className="card-header text-center">
          <h2 className="mb-0">🌟 Success Stories</h2>
          <p className="text-muted mb-0">Inspiring journeys of scholarship recipients who transformed their lives</p>
        </div>
        <div className="card-body">
          <div className="row text-center mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h4>{successStories.length}</h4>
                  <p className="mb-0">Success Stories</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h4>₹{successStories.reduce((sum, story) => sum + parseInt(story.amount.replace(/[^\d]/g, '')), 0).toLocaleString()}</h4>
                  <p className="mb-0">Total Scholarships</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h4>{new Set(successStories.map(story => story.university)).size}</h4>
                  <p className="mb-0">Universities</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h4>{new Set(successStories.map(story => story.location)).size}</h4>
                  <p className="mb-0">States</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <h5>Filter by Category:</h5>
            <div className="d-flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success Stories Grid */}
      <div className="row">
        {filteredStories.map((story, index) => (
          <motion.div
            key={story.id}
            className="col-lg-6 col-xl-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-gradient-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">{story.name}</h5>
                    <small>{story.university} • {story.year}</small>
                  </div>
                  <div className="fs-1">{story.image}</div>
                </div>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h6 className="text-primary">{story.scholarship}</h6>
                  <p className="text-muted mb-2">
                    <strong>Amount:</strong> {story.amount} • <strong>Field:</strong> {story.field}
                  </p>
                  <p className="text-muted mb-0">
                    <strong>Location:</strong> {story.location}
                  </p>
                </div>

                <div className="mb-3">
                  <h6>Their Journey:</h6>
                  <div className="row">
                    <div className="col-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <div className="text-danger mb-1">❌ Before</div>
                          <small>{story.before}</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-success text-white">
                        <div className="card-body text-center">
                          <div className="mb-1">✅ After</div>
                          <small>{story.after}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6>Their Story:</h6>
                  <p className="small text-muted">
                    "{story.story}"
                  </p>
                </div>

                <div className="text-center">
                  <span className="badge bg-primary me-2">{story.category.toUpperCase()}</span>
                  <span className="badge bg-success">{story.year}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card mt-4"
      >
        <div className="card-body text-center">
          <h4>🌟 Be the Next Success Story!</h4>
          <p className="text-muted mb-3">
            These inspiring stories show that with determination and the right support, anything is possible. 
            Start your journey today by exploring scholarships that match your profile.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-primary">
              🔍 Find Scholarships
            </button>
            <button className="btn btn-outline-primary">
              ✅ Check Eligibility
            </button>
            <button className="btn btn-outline-success">
              📝 Apply Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card mt-4"
      >
        <div className="card-header">
          <h4 className="mb-0">💬 What Our Scholars Say</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card border-primary">
                <div className="card-body text-center">
                  <div className="fs-1 mb-2">⭐</div>
                  <p className="small">"This scholarship didn't just pay for my education, it gave me the confidence to dream big and achieve my goals."</p>
                  <strong>- Priya Sharma</strong>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-success">
                <div className="card-body text-center">
                  <div className="fs-1 mb-2">⭐</div>
                  <p className="small">"From a small village to AIIMS Delhi - this scholarship made my medical dreams come true."</p>
                  <strong>- Rahul Kumar</strong>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card border-info">
                <div className="card-body text-center">
                  <div className="fs-1 mb-2">⭐</div>
                  <p className="small">"The support I received went beyond financial aid - it was a complete transformation of my life and career."</p>
                  <strong>- Sneha Reddy</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessStories; 