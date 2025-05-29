(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function X(e){let s="",t="";if(e&&e.isAuthenticated&&e.user){const i=e.user.name||"User";s+=`<li class="welcome-message">Welcome, ${i}! (${e.user.role})</li>`,s+='<li><a href="#home">Course Home</a></li>';let r="#my-learning",a='<li><a href="#my-learning">My Learning</a></li>';(e.user.role==="instructor"||e.user.role==="admin")&&(r="#instructor-panel",a+='<li><a href="#instructor-panel">Instructor Panel</a></li>'),e.user.role==="admin"&&(r="#admin-panel",a+='<li><a href="#admin-panel">Admin Panel</a></li>'),e.user.role==="learner"?s+=`<li><a href="${r}">My Dashboard</a></li>`:s+=`
                <li class="dropdown-menu-item">
                    <a href="${r}" aria-haspopup="true">My Dashboard</a>
                    <ul class="dropdown-content">
                        ${a}
                    </ul>
                </li>`,t='<li><a href="#logout">Logout</a></li>'}else s='<li><a href="#home">Course Home</a></li>',t='<li><a href="#login">Login</a></li><li><a href="#signup">Sign Up</a></li>';return`<header><nav><a href="#home" class="logo" aria-label="SkillShareHub Home">🎓 SkillShareHub</a><ul>${s}${t}</ul></nav></header>`}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function ve(){return`
        <footer>
            <p>© ${new Date().getFullYear()} SkillShareHub. All rights reserved.</p>
            <p>
                <a href="#about">About Us</a> | 
                <a href="#contact">Contact</a> | 
                <a href="#privacy">Privacy Policy</a>
            </p>
        </footer>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function De(e){const s="https://via.placeholder.com/300x200.png?text=Course+Image",t=e.price?`$${e.price.toFixed(2)}`:"Free";return`
        <article class="course-card" data-course-id="${e.id}" aria-labelledby="course-title-${e.id}">
            <img src="${e.thumbnailUrl||s}" alt="${e.title}" class="course-thumbnail">
            <div class="course-card-content">
                <h3 id="course-title-${e.id}">${e.title}</h3>
                <p class="course-instructor">By: ${e.instructorName||e.instructor||"Unknown Instructor"}</p>
                <p class="course-category">Category: ${e.category}</p>
                <p class="course-price">${t}</p>
                <p class="course-rating">Rating: ${e.rating?`${e.rating.toFixed(1)} ⭐`:"N/A"}</p>
                <button class="button-like primary view-details-btn">View Details</button>
            </div>
        </article>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/var ze="http://localhost:3001/api/courses";async function _e(e=new URLSearchParams,s){let t=[],i=!0,r=null;const a=new URLSearchParams;e.get("query")&&a.set("query",e.get("query")),e.get("category")&&a.set("category",e.get("category")),e.get("price")&&a.set("price",e.get("price"));try{const n=await fetch(`${ze}?${a.toString()}`);if(!n.ok){const c=await n.json().catch(()=>({}));throw new Error(c.message||`HTTP error ${n.status}`)}t=await n.json()}catch(n){console.error("Failed to fetch courses:",n),r=n.message}finally{i=!1}let o;return i?o='<p class="loading-message">Loading courses...</p>':r?o=`<p class="error-message">Could not load courses: ${r}.</p>`:t.length===0?o='<p class="not-found">No courses found.</p>':o=`<div class="course-list">${t.map(n=>De(n)).join("")}</div>`,`<section class="course-list-section" aria-labelledby="cl-title"><h2 id="cl-title" class="sr-only">Courses</h2>${o}</section>`}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/var de="http://localhost:3001/api/auth";function ue(e){const s=e==="login",t=s?"Login to SkillShareHub":"Create Your SkillShareHub Account",i=s?"Login":"Sign Up",r=s?"Don't have an account? Sign Up":"Already have an account? Login",a=s?"#signup":"#login";return`
        <section class="auth-form-container" id="${e}-form-section" aria-labelledby="${e}-form-title">
            <h2 id="${e}-form-title">${t}</h2>
            <form id="${e}-form" novalidate>
                <div id="${e}-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                ${s?"":`
                    <div class="form-group">
                        <label for="${e}-name">Full Name</label>
                        <input type="text" id="${e}-name" name="name" required autocomplete="name" aria-required="true">
                    </div>
                `}
                <div class="form-group">
                    <label for="${e}-email">Email Address</label>
                    <input type="email" id="${e}-email" name="email" required autocomplete="email" aria-required="true">
                </div>
                <div class="form-group">
                    <label for="${e}-password">Password</label>
                    <input type="password" id="${e}-password" name="password" required autocomplete="${s?"current-password":"new-password"}" aria-required="true" minlength="6">
                </div>
                ${s?"":`
                    <div class="form-group">
                        <label for="signup-role">I am a:</label>
                        <select id="signup-role" name="role" required aria-required="true">
                            <option value="learner" selected>Learner</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                `}
                <button type="submit" class="primary">${i}</button>
            </form>
            <p>
                <a href="${a}">${r}</a>
            </p>
            <div class="divider">OR</div>
            <a href="http://localhost:3001/api/auth/google" id="google-oauth-btn-link" class="button-like secondary" style="display:flex; align-items:center; justify-content:center; text-decoration:none; background-color: #db4437;" type="button">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" aria-hidden="true" style="width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;">
                Sign ${s?"in":"up"} with Google
            </a>
        </section>
    `}async function pe(e,s){const t=document.getElementById(`${s}-feedback`);if(!t){console.error("Feedback div not found for form type:",s);return}t.textContent="Processing...",t.className="form-feedback processing",t.style.display="block";const i=new FormData(e),r=Object.fromEntries(i.entries());if(!r.email||s==="signup"&&!r.name||!r.password){t.textContent="Please fill in all required fields.",t.className="form-feedback error";return}if(r.password.length<6){t.textContent="Password must be at least 6 characters long.",t.className="form-feedback error";return}const a=s==="login"?`${de}/login`:`${de}/signup`;try{const o=await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),n=await o.json();if(!o.ok)throw new Error(n.message||`An error occurred: ${o.status}`);if(s==="signup")t.textContent=n.message||"Signup successful! Please login.",t.className="form-feedback success",e.reset(),setTimeout(()=>{window.location.hash="#login"},2e3);else{const c=new CustomEvent("authChange",{detail:{isAuthenticated:!0,user:n.user,token:n.token}});document.dispatchEvent(c),t.textContent=n.message||"Login successful! Redirecting...",t.className="form-feedback success"}}catch(o){console.error(`Error during ${s}:`,o),t.textContent=o.message||"Network error or server issue. Please try again.",t.className="form-feedback error"}}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/var Ue="http://localhost:3001/api/dashboard";async function ae(e,s){try{const t=await fetch(`${Ue}${e}`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`}});if(!t.ok){const i=await t.json().catch(()=>({}));throw new Error(i.message||`HTTP error ${t.status}`)}return await t.json()}catch(t){return console.error(`Error fetching ${e}:`,t),null}}async function me(e,s="My Dashboard"){const t=localStorage.getItem("skillShareHubToken");if(!t||!e)return'<section class="user-dashboard-section"><p class="error-message">Please <a href="#login">login</a>.</p></section>';let i='<p class="loading-message">Loading courses...</p>',r='<p class="loading-message">Loading reviews...</p>',a='<p class="loading-message">Loading certificates...</p>';const[o,n,c]=await Promise.all([ae("/enrolled-courses",t),ae("/my-reviews",t),ae("/my-certificates",t)]);return o?o.length>0?i=`<ul class="enrolled-courses-list">${o.map(l=>{let d="Proceed",p="button-like accent";return l.enrollmentStatus==="completed"||l.progress&&l.progress===100?(d="Summary",p="button-like summary-btn"):l.progress===0&&l.enrollmentStatus==="enrolled"&&(d="Start Learning"),`<li class="course-item-ud">
                            <img src="${l.thumbnailUrl||"https://via.placeholder.com/150x100.png?text=Course"}" alt="${l.title}" class="course-thumbnail-ud">
                            <div class="course-info-ud">
                                <h4>${l.title}</h4>
                                <p class="course-instructor-ud">By: ${l.instructorName||l.instructor}</p>
                                <progress value="${l.progress||0}" max="100"></progress>
                                <span>${l.progress||0}% Complete</span>
                            </div>
                            <div class="course-actions-ud">
                                <a href="#course-view/${l.id}" class="${p}">${d}</a>
                            </div>
                        </li>`}).join("")}</ul>`:i='<p>You are not enrolled in any courses yet. <a href="#courses">Explore courses</a>!</p>':i='<p class="error-message">Could not load your enrolled courses.</p>',n?n.length>0?r=`<ul class="reviews-list">${n.map(l=>`<li><strong>${l.courseTitle}</strong> - ${"⭐".repeat(l.rating)}(${l.rating})<p>${l.reviewText}</p><small>${new Date(l.date||l.createdAt).toLocaleDateString()}</small></li>`).join("")}</ul>`:r="<p>You have not submitted any reviews yet.</p>":r='<p class="error-message">Could not load your reviews.</p>',c?c.length>0?a=`<ul class="certificates-list">${c.map(l=>`
                <li>
                    <strong>${l.courseTitle}</strong> - Issued: ${new Date(l.issueDate).toLocaleDateString()}
                    <a href="${l.certificateUrl||"#"}" class="button-like secondary view-certificate-btn" 
                       ${l.certificateUrl&&l.certificateUrl!=="#"?"":'disabled aria-disabled="true"'}>
                       View Certificate ${l.certificateUrl&&l.certificateUrl!=="#"?"":"(Generation Pending or NI)"}
                    </a>
                </li>`).join("")}</ul>`:a="<p>You have not earned any certificates yet.</p>":a='<p class="error-message">Could not load your certificates.</p>',`
        <section id="user-dashboard" class="user-dashboard-section" aria-labelledby="ud-title">
            <h2 id="ud-title">${s}</h2>
            <p>Welcome back, ${e.name}! Here's an overview of your learning journey.</p>
            <div class="dashboard-subsection">
                <h3>Enrolled Courses</h3>
                ${i}
            </div>
            <div class="dashboard-subsection">
                <h3>My Reviews</h3>
                ${r}
            </div>
            <div class="dashboard-subsection">
                <h3>Certificates Earned</h3>
                ${a}
            </div>
        </section>`}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/var xe="http://localhost:3001/api/instructor";async function fe(e,s){try{const t=await fetch(`${xe}${e}`,{headers:{Authorization:`Bearer ${s}`}});if(!t.ok){const i=await t.json().catch(()=>({}));throw new Error(i.message||`HTTP error ${t.status}`)}return await t.json()}catch(t){return console.error(`Error fetching instructor data from ${e}:`,t),null}}async function ge(e,s="Instructor Dashboard"){var n,c;if(!e||!e.isAuthenticated||((n=e.user)==null?void 0:n.role)!=="instructor"&&((c=e.user)==null?void 0:c.role)!=="admin")return'<p class="error-message">Access Denied. You must be an instructor or admin to view this page.</p>';const t=e.token;let i='<p class="loading-message">Loading your courses...</p>',r='<p class="loading-message">Loading summary...</p>';const[a,o]=await Promise.all([fe("/courses",t),fe("/dashboard-summary",t)]);return a?a.length>0?i=`
                <ul class="instructor-courses-list">
                    ${a.map(l=>`
                        <li data-course-id="${l.id}">
                            <strong>${l.title}</strong><br>
                            Category: ${l.category} | Price: $${(l.price||0).toFixed(2)} | Rating: ${l.rating||"N/A"} ⭐<br>
                            <a href="/#edit-course/${l.id}" class="button-like secondary edit-course-btn">Edit Course</a>
                             <a href="/#course-view/${l.id}" class="button-like secondary view-course-btn" style="margin-left: 5px;">View Course</a>
                        </li>
                    `).join("")}
                </ul>`:i='<p>You have not created any courses yet. <a href="#create-course">Create your first course</a>!</p>':i='<p class="error-message">Could not load your courses.</p>',o?r=`
            <p>Total Courses: ${o.totalCourses}</p>
            <p>Total Enrollments: ${o.totalEnrollments}</p>
            <p>Total Revenue: $${(o.totalRevenue||0).toFixed(2)}</p>
            <p>Average Rating: ${o.averageRating||"N/A"} ⭐</p>
            <a href="/#instructor-analytics" class="button-like">View Detailed Analytics</a>
        `:r='<p class="error-message">Could not load dashboard summary.</p>',`
        <section id="instructor-dashboard" class="instructor-dashboard-section" aria-labelledby="instructor-dashboard-title">
            <h2 id="instructor-dashboard-title">${s}</h2>
            <p>Welcome, ${e.user.name}! Manage your courses, view enrollments, and track your earnings.</p>
            <a href="#create-course" id="create-new-course-btn-instructor" class="button-like accent">Create New Course</a> 
            
            <h3>My Courses</h3>
            ${i}

            <h3>Earnings & Analytics Summary</h3>
            ${r}
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const He="http://localhost:3001/api/admin";async function oe(e,s){try{const t=await fetch(`${He}${e}`,{headers:{Authorization:`Bearer ${s}`}});if(!t.ok){const i=await t.json().catch(()=>({message:`HTTP error ${t.status}`}));throw new Error(i.message||`HTTP error ${t.status}`)}return await t.json()}catch(t){return console.error(`Error fetching admin data from ${e}:`,t),null}}async function Ee(e){var y;if(!e||!e.isAuthenticated||((y=e.user)==null?void 0:y.role)!=="admin")return'<p class="error-message">Access Denied. You must be an admin.</p>';const s=e.token;let t='<p class="loading-message">Loading users...</p>',i='<p class="loading-message">Loading courses...</p>',r='<p class="loading-message">Loading reviews...</p>',a="N/A",o="N/A",n=0,c=[];const[l,d,p]=await Promise.all([oe("/users",s),oe("/courses",s),oe("/reviews",s)]);if(l?(a=l.length,l.length>0?t=`
                <div class="admin-user-management-list">
                    <div class="admin-user-management-header">
                        <span>User</span>
                        <span>Role</span>
                        <span>Joined</span>
                        <span style="text-align:center;">Status</span>
                        <span style="text-align:right;">Actions</span>
                    </div>
                    ${l.map(g=>`
                        <div class="admin-user-management-item" data-user-id-li="${g.id}">
                            <span class="um-user" data-label="User: ">${g.name}<br><small>${g.email} ${g.isGoogleUser==="Yes"?"(G)":""}</small></span>
                            <span class="um-role" data-label="Role: ">${g.role}</span>
                            <span class="um-joined" data-label="Joined: ">${new Date(g.joined).toLocaleDateString()}</span>
                            <span class="um-status" data-label="Status: ">${g.isBlocked?"🔴 Blocked":"🟢 Active"}</span>
                            <span class="um-actions">
                                <button class="button-like ${g.isBlocked?"secondary":"warning"} admin-block-user-btn"
                                        data-user-id="${g.id}"
                                        data-user-name="${g.name}"
                                        data-is-blocked="${g.isBlocked}"
                                        ${g.email==="admin@skillshare.hub"?"disabled":""}>
                                    ${g.isBlocked?"Unblock":"Block"}
                                </button>
                                <button class="button-like danger admin-delete-user-btn"
                                        data-user-id="${g.id}"
                                        data-user-name="${g.name}"
                                        data-user-email="${g.email}"
                                        ${g.email==="admin@skillshare.hub"?"disabled":""}>
                                    Delete
                                </button>
                            </span>
                        </div>
                    `).join("")}
                </div>`:t="<p>No users found.</p>"):t='<p class="error-message">Could not load user list.</p>',d){o=d.length,n=d.reduce((u,m)=>u+(m.revenueGenerated||0),0);const g=[...d].filter(u=>u.price>0&&u.revenueGenerated>0).sort((u,m)=>m.revenueGenerated-u.revenueGenerated);c=g.slice(0,3);const v=d.sort((u,m)=>new Date(m.created)-new Date(u.created)).map(u=>{const m=g.findIndex(S=>S.id===u.id);let b="➖";return m!==-1&&m<3&&u.price>0&&u.revenueGenerated>0&&(b=m===0?"🔥 1":`${m+1}`),{...u,trendingDisplay:b}});v.length>0?i=`
                <div class="admin-course-moderation-list">
                    <div class="admin-course-moderation-header">
                        <span style="text-align:center;">Trending</span>
                        <span>Course Name</span>
                        <span>Instructor</span>
                        <span style="text-align:right;">Revenue</span>
                        <span style="text-align:center;">Rating</span>
                        <span style="text-align:right;">Actions</span>
                    </div>
                    ${v.map(u=>`
                        <div class="admin-course-moderation-item">
                            <span class="cm-trending" data-label="Trending: ">${u.trendingDisplay}</span>
                            <span class="cm-course-name" data-label="Course: ">${u.title} <br><small>Category: ${u.category}</small></span>
                            <span class="cm-instructor" data-label="Instructor: ">${u.instructorName}</span>
                            <span class="cm-revenue" data-label="Revenue: " style="text-align:right;">$${(u.revenueGenerated||0).toFixed(2)}</span>
                            <span class="cm-flagged" data-label="Rating: " style="text-align:center;">${u.rating?`${u.rating.toFixed(1)} ⭐`:"N/A"}</span>
                            <span class="cm-actions">
                                <a href="#edit-course/${u.id}" class="button-like secondary admin-edit-course-btn" data-course-id="${u.id}">Edit</a>
                                <button class="button-like danger admin-delete-course-btn" data-course-id="${u.id}" data-course-title="${u.title}">Delete</button>
                            </span>
                        </div>
                    `).join("")}
                </div>`:i="<p>No courses found.</p>"}else i='<p class="error-message">Could not load course list.</p>',o="Error";if(p){const g=p.sort((v,u)=>v.isFlagged&&!u.isFlagged?-1:!v.isFlagged&&u.isFlagged?1:new Date(u.date)-new Date(v.date));g.length>0?r=`
                <ul class="admin-review-moderation-list">
                    ${g.map(v=>`
                        <li class="admin-review-item" data-review-id="${v.id}">
                            <div class="review-item-content">
                                <div class="review-text-display">
                                    <p><strong>Review for "${v.courseTitle||"N/A"}":</strong></p>
                                    <p class="editable-review-text">${v.reviewText}</p>
                                </div>
                                <div class="review-edit-mode" style="display:none;">
                                    <textarea class="review-edit-area" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="review-item-meta">
                                <p><strong>By:</strong> ${v.userName||"N/A"} (${v.userEmail||"N/A"})</p>
                                <p><strong>Rating:</strong> ${"⭐".repeat(v.rating)} (${v.rating}/5)</p>
                                <p><strong>Date:</strong> ${new Date(v.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span class="admin-review-flag-status" data-flagged="${v.isFlagged}">${v.isFlagged?"🚩 Flagged":"🟢 Clear"}</span></p>
                            </div>
                            <div class="review-item-actions">
                                <button class="button-like secondary admin-edit-review-btn">Edit</button>
                                <button class="button-like accent admin-save-review-btn" style="display:none;">Save</button>
                                <button class="button-like admin-cancel-edit-review-btn" style="display:none;">Cancel</button>
                                <button class="button-like ${v.isFlagged?"secondary":"warning"} admin-toggle-flag-review-btn" data-review-id="${v.id}" data-current-flag-status="${v.isFlagged}">
                                    ${v.isFlagged?"Unflag":"Flag"}
                                </button>
                                <button class="button-like danger admin-delete-review-btn" data-review-id="${v.id}" data-review-text="${v.reviewText.substring(0,30)}...">Delete</button>
                            </div>
                        </li>
                    `).join("")}
                </ul>`:r="<p>No reviews found.</p>"}else r='<p class="error-message">Could not load reviews.</p>';const h=c.length>0?`<ul>${c.map(g=>`<li>${g.title}: $${g.revenueGenerated.toFixed(2)}</li>`).join("")}</ul>`:"No revenue data for top courses.";return`
        <section id="admin-panel" class="admin-panel-section" aria-labelledby="admin-panel-title">
            <h2 id="admin-panel-title">Admin Panel</h2>
            <p>Oversee platform operations, manage users, content, and reviews.</p>

            <div class="admin-metrics-grid">
                <div class="metric-card"><h4>Total Users</h4><p id="admin-total-users-metric" class="metric-value">${a}</p></div>
                <div class="metric-card"><h4>Active Courses</h4><p id="admin-active-courses-metric" class="metric-value">${o}</p></div>
                <div class="metric-card" id="total-revenue-card">
                    <h4>Total Revenue</h4>
                    <p class="metric-value">$${n.toFixed(2)}</p>
                    <div class="metric-tooltip">${h}</div>
                </div>
            </div>

            <h3>User Management</h3>
            <div id="admin-user-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${t}

            <h3>Content Moderation (Courses)</h3>
            <div id="admin-content-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${i}

            <h3>Review Moderation</h3>
            <div id="admin-review-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${r}

            <h3>Site Settings (NI)</h3>
            <p>Manage system-wide settings and configurations.</p>
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function Be(e=new URLSearchParams){const s=e.get("query")||"",t=e.get("category")||"",i=e.get("price")||"",r=[{value:"",display:"All Categories"},{value:"Programming",display:"Programming"},{value:"Design",display:"Design"},{value:"Business",display:"Business"},{value:"Data Science",display:"Data Science"},{value:"Marketing",display:"Marketing"},{value:"Personal Development",display:"Personal Development"},{value:"Other",display:"Other"}],a=[{value:"",display:"All Prices"},{value:"free",display:"Free"},{value:"paid",display:"Paid"}];return`
        <section class="search-bar-section" aria-label="Course Search and Filters">
            <form id="search-form" role="search">
                <div class="search-bar-container">
                    <label for="search-input" class="sr-only">Search for courses</label>
                    <input type="search" id="search-input" name="query" placeholder="Search by keyword, title, instructor..." aria-label="Search for courses" value="${s}">
                    <button type="submit" class="button-like primary">Search</button>
                </div>
                <div class="filter-options" style="margin-top: 10px; display: flex; gap: 15px; align-items: center; flex-wrap:wrap;">
                    <div>
                        <label for="filter-category" style="margin-right: 5px;">Category:</label>
                        <select id="filter-category" name="category" aria-label="Filter by category">
                            ${r.map(o=>`<option value="${o.value}" ${t===o.value?"selected":""}>${o.display}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label for="filter-price" style="margin-right: 5px;">Price:</label>
                        <select id="filter-price" name="price" aria-label="Filter by price">
                             ${a.map(o=>`<option value="${o.value}" ${i===o.value?"selected":""}>${o.display}</option>`).join("")}
                        </select>
                    </div>
                    <button type="submit" class="button-like secondary" style="padding: 0.6rem 1rem;">Apply Filters</button> 
                </div>
            </form>
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/var je="http://localhost:3001/api/courses";let Z=0,x={},H={},E={};function Me(e){return`
        <div class="section-item" data-section-index="${e}">
            <div class="section-header">
                <h4>Section ${e+1}</h4>
                <button type="button" class="remove-section-btn remove-btn" aria-label="Remove Section ${e+1}">Remove Section</button>
            </div>
            <div class="form-group">
                <label for="section-title-${e}">Section Title</label>
                <input type="text" id="section-title-${e}" required class="section-title-input">
            </div>
            <div class="lessons-container" id="lessons-container-${e}"></div>
            <button type="button" class="add-lesson-btn add-btn" data-section-index="${e}">+ Add Lesson</button>
        </div>
    `}function Oe(e,s){const t=`lesson_s${e}_l${s}_videoFile`;return`
        <div class="lesson-item" data-section-index="${e}" data-lesson-index="${s}">
            <div class="lesson-header">
                <h5>Lesson ${e+1}.${s+1}</h5>
                <button type="button" class="remove-lesson-btn remove-btn" aria-label="Remove Lesson">Remove Lesson</button>
            </div>
            <div class="form-group">
                <label for="lesson-title-${e}-${s}">Lesson Title</label>
                <input type="text" id="lesson-title-${e}-${s}" required class="lesson-title-input">
            </div>
            <div class="form-group">
                <label for="lesson-videoUrl-${e}-${s}">Video URL (e.g., YouTube, Vimeo)</label>
                <input type="url" id="lesson-videoUrl-${e}-${s}" class="lesson-videoUrl-input" placeholder="https://example.com/video_url">
            </div>
            <div class="form-group">
                <label for="${t}">Or Upload Video File (Overrides URL if both provided):</label>
                <input type="file" id="${t}" name="${t}" class="lesson-videoFile-input" accept="video/*">
            </div>
            <div class="form-group">
                <label for="lesson-description-${e}-${s}">Lesson Description</label>
                <textarea id="lesson-description-${e}-${s}" class="lesson-description-input" rows="3"></textarea>
            </div>
            <div class="resources-container" id="resources-container-${e}-${s}"><h6>Resources for this Lesson:</h6></div>
            <button type="button" class="add-resource-btn add-btn" data-section-index="${e}" data-lesson-index="${s}">+ Add Resource</button>
            <div class="quiz-container" id="quiz-container-${e}-${s}"><h6>Quiz for this Lesson:</h6></div>
            <button type="button" class="add-quiz-question-btn add-btn" data-section-index="${e}" data-lesson-index="${s}">+ Add Quiz Question</button>
        </div>
    `}function Ie(e,s,t){const i=`resource_s${e}_l${s}_r${t}_file`;return`
        <div class="resource-item" data-section-index="${e}" data-lesson-index="${s}" data-resource-index="${t}">
            <div class="resource-header">
                <p class="item-label">Resource ${t+1}</p>
                <button type="button" class="remove-resource-btn remove-btn" aria-label="Remove Resource">X</button>
            </div>
            <div class="form-group">
                <label for="resource-name-${e}-${s}-${t}">Resource Name</label>
                <input type="text" id="resource-name-${e}-${s}-${t}" required class="resource-name-input">
            </div>
            <div class="form-group">
                <label for="resource-url-${e}-${s}-${t}">Resource URL (e.g., PDF link, website)</label>
                <input type="url" id="resource-url-${e}-${s}-${t}" class="resource-url-input" placeholder="https://example.com/document.pdf">
            </div>
            <div class="form-group">
                <label for="${i}">Or Upload Resource File (Overrides URL):</label>
                <input type="file" id="${i}" name="${i}" class="resource-file-input">
            </div>
        </div>
    `}function Qe(e,s,t){let i="";for(let r=0;r<4;r++)i+=`
            <div class="form-group">
                <label for="quiz-option-${e}-${s}-${t}-${r}">Option ${r+1}</label>
                <input type="text" id="quiz-option-${e}-${s}-${t}-${r}" required class="quiz-option-input">
            </div>
        `;return`
        <div class="quiz-question-item" data-section-index="${e}" data-lesson-index="${s}" data-question-index="${t}">
            <div class="quiz-header">
                <p class="item-label">Question ${t+1}</p>
                <button type="button" class="remove-quiz-question-btn remove-btn" aria-label="Remove Question">X</button>
            </div>
            <div class="form-group">
                <label for="quiz-questionText-${e}-${s}-${t}">Question Text</label>
                <textarea id="quiz-questionText-${e}-${s}-${t}" required class="quiz-questionText-input" rows="2"></textarea>
            </div>
            ${i}
            <div class="form-group">
                <label for="quiz-correctAnswer-${e}-${s}-${t}">Correct Answer</label>
                <select id="quiz-correctAnswer-${e}-${s}-${t}" required class="quiz-correctAnswer-select">
                    <option value="0">Option 1 is Correct</option>
                    <option value="1">Option 2 is Correct</option>
                    <option value="2">Option 3 is Correct</option>
                    <option value="3">Option 4 is Correct</option>
                </select>
            </div>
        </div>
    `}function Ve(){const e=document.getElementById("sections-container");if(e){const s=Z;e.insertAdjacentHTML("beforeend",Me(s)),x[s.toString()]=0,Z++}}function Ye(e,s){const t=e.closest(s);t&&t.remove()}function Ge(e){const s=e.dataset.sectionIndex,t=document.getElementById(`lessons-container-${s}`);if(t){const i=s.toString();x[i]===void 0&&(x[i]=0);const r=x[i];t.insertAdjacentHTML("beforeend",Oe(s,r));const a=`${i}_${r}`;H[a]=0,E[a]=0,x[i]++}}function We(e){const s=e.dataset.sectionIndex,t=e.dataset.lessonIndex,i=document.getElementById(`resources-container-${s}-${t}`);if(i){const r=`${s}_${t}`;H[r]===void 0&&(H[r]=0);const a=H[r];i.insertAdjacentHTML("beforeend",Ie(s,t,a)),H[r]++}}function Je(e){const s=e.dataset.sectionIndex,t=e.dataset.lessonIndex,i=document.getElementById(`quiz-container-${s}-${t}`);if(i){const r=`${s}_${t}`;E[r]===void 0&&(E[r]=0);const a=E[r];i.insertAdjacentHTML("beforeend",Qe(s,t,a)),E[r]++}}function he(){return Z=0,x={},H={},E={},`
        <section class="create-course-form-container" aria-labelledby="create-course-title">
            <h2 id="create-course-title">Create New Course</h2>
            <form id="create-course-form" novalidate>
                <div id="create-course-feedback" class="form-feedback" aria-live="assertive"></div>
                <fieldset><legend>Course Details</legend>
                    <div class="form-group"><label for="course-title">Title</label><input type="text" id="course-title" name="title" required></div>
                    <div class="form-group"><label for="course-description">Description</label><textarea id="course-description" name="description" rows="5" required></textarea></div>
                    <div class="form-group"><label for="course-category">Category</label><select id="course-category" name="category" required><option value="">Select category</option><option value="Programming">Programming</option><option value="Design">Design</option><option value="Business">Business</option><option value="Data Science">Data Science</option><option value="Marketing">Marketing</option><option value="Personal Development">Personal Development</option><option value="Other">Other</option></select></div>
                    <div class="form-group"><label for="course-price">Price (USD)</label><input type="number" id="course-price" name="price" min="0" step="0.01" placeholder="0 for free"></div>
                    <div class="form-group"><label for="course-thumbnailImage">Thumbnail Image</label><input type="file" id="course-thumbnailImage" name="thumbnailImage" accept="image/*"></div>
                    <div class="form-group"><label for="course-tags">Tags (comma-separated)</label><input type="text" id="course-tags" name="tags" placeholder="e.g., web, js, react"></div>
                </fieldset>
                <fieldset><legend>Course Content</legend><div id="sections-container"></div><button type="button" id="add-section-btn" class="button-like secondary add-btn">+ Add Section</button></fieldset>
                <button type="submit" class="accent button-like" style="width:100%; padding: 1rem;">Create Course</button>
            </form>
        </section>`}async function ye(e){const s=document.getElementById("create-course-feedback");s.textContent="Processing...",s.className="form-feedback processing",s.style.display="block";const t=localStorage.getItem("skillShareHubToken");if(!t){s.textContent="Auth error.",s.className="form-feedback error";return}const i=new FormData;i.append("title",e.querySelector("#course-title").value),i.append("description",e.querySelector("#course-description").value),i.append("category",e.querySelector("#course-category").value),i.append("price",e.querySelector("#course-price").value||"0"),i.append("tags",e.querySelector("#course-tags").value);const r=e.querySelector("#course-thumbnailImage").files[0];r&&i.append("thumbnailImage",r);const a=[];if(e.querySelectorAll(".section-item").forEach((o,n)=>{const c=o.querySelector(".section-title-input");if(!c||!c.value.trim()){console.warn(`Skipping section ${n} with empty title`);return}const l={title:c.value.trim(),lessons:[]};o.querySelectorAll(".lesson-item").forEach((d,p)=>{const h=d.querySelector(".lesson-title-input");if(!h||!h.value.trim()){console.warn(`Skipping lesson ${p} in section ${n} with empty title`);return}const y={title:h.value.trim(),videoUrl:d.querySelector(".lesson-videoUrl-input").value.trim(),description:d.querySelector(".lesson-description-input").value.trim(),resources:[],quiz:[]},g=d.querySelector(".lesson-videoFile-input");g&&g.files[0]&&i.append(`lesson_s${n}_l${p}_videoFile`,g.files[0]),d.querySelectorAll(".resource-item").forEach((v,u)=>{const m=v.querySelector(".resource-name-input"),b=v.querySelector(".resource-url-input");if(m&&m.value.trim()){const S={name:m.value.trim(),url:b.value.trim()};y.resources.push(S);const w=v.querySelector(".resource-file-input");w&&w.files[0]&&i.append(`resource_s${n}_l${p}_r${u}_file`,w.files[0])}else console.warn(`Skipping resource S${n}L${p}R${u} due to empty name.`)}),d.querySelectorAll(".quiz-question-item").forEach((v,u)=>{const m=v.querySelector(".quiz-questionText-input");if(!m||!m.value.trim()){console.warn(`Skipping quiz S${n}L${p}Q${u} due to empty text.`);return}const b=[];let S=!0;for(let L=0;L<4;L++){const A=v.querySelector(`#quiz-option-${n}-${p}-${u}-${L}`);A&&A.value.trim()?b.push(A.value.trim()):S=!1}if(!S||b.length!==4){console.warn(`Skipping quiz S${n}L${p}Q${u} due to incomplete options.`);return}const w=v.querySelector(".quiz-correctAnswer-select"),k=w?parseInt(w.value):-1;if(k<0||k>3){console.warn(`Skipping quiz S${n}L${p}Q${u} due to invalid correct answer.`);return}y.quiz.push({questionText:m.value.trim(),options:b,correctAnswerIndex:k})}),l.lessons.push(y)}),a.push(l)}),i.append("sections",JSON.stringify(a)),!i.get("title")||!i.get("description")||!i.get("category")){s.textContent="Title, Description, and Category are required.",s.className="form-feedback error";return}try{const o=await fetch(je,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i}),n=await o.json();if(!o.ok)throw new Error(n.message||`HTTP error ${o.status}`);s.textContent="Course created successfully!",s.className="form-feedback success",e.reset(),document.getElementById("sections-container").innerHTML="",Z=0,x={},H={},E={},setTimeout(()=>{window.location.hash="#instructor-dashboard"},1500)}catch(o){console.error("Error creating course:",o),s.textContent=o.message||"Failed to create course.",s.className="form-feedback error"}}const Ke=Object.freeze(Object.defineProperty({__proto__:null,addLesson:Ge,addQuizQuestion:Je,addResource:We,addSection:Ve,handleCreateCourseFormSubmit:ye,removeElement:Ye,renderCreateCourseForm:he},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const $e="http://localhost:3001/api/courses";let G=0,z={},_={},U={};function be(e,s={}){const t=s.title||"";return z[e.toString()]=s.lessons?s.lessons.length:0,`
        <div class="section-item" data-section-index="${e}">
            <div class="section-header"><h4>Section ${e+1}</h4><button type="button" class="remove-section-btn remove-btn">Remove Section</button></div>
            <div class="form-group"><label for="edit-section-title-${e}">Section Title</label><input type="text" id="edit-section-title-${e}" class="section-title-input" value="${t}" required></div>
            <div class="lessons-container" id="edit-lessons-container-${e}">${s.lessons?s.lessons.map((i,r)=>we(e,r,i)).join(""):""}</div>
            <button type="button" class="add-lesson-btn add-btn" data-section-index="${e}">+ Add Lesson</button>
        </div>`}function we(e,s,t={}){const i=t.title||"",r=t.videoUrl||"",a=t.description||"",o=`lesson_s${e}_l${s}_videoFile`,n=r?`<p style="font-size:0.8em; margin-top:5px;">Current Video: <a href="${r}" target="_blank" rel="noopener noreferrer">${r.substring(0,40)}...</a></p>`:'<p style="font-size:0.8em; margin-top:5px;">No current video URL.</p>',c=`${e}_${s}`;return _[c]=t.resources?t.resources.length:0,U[c]=t.quiz?t.quiz.length:0,`
        <div class="lesson-item" data-section-index="${e}" data-lesson-index="${s}">
            <div class="lesson-header"><h5>Lesson ${e+1}.${s+1}</h5><button type="button" class="remove-lesson-btn remove-btn">Remove Lesson</button></div>
            <div class="form-group"><label for="edit-lesson-title-${e}-${s}">Title</label><input type="text" id="edit-lesson-title-${e}-${s}" class="lesson-title-input" value="${i}" required></div>
            <div class="form-group">
                <label for="edit-lesson-videoUrl-${e}-${s}">Video URL (Enter new to replace, or leave blank to keep current/use upload)</label>
                <input type="url" id="edit-lesson-videoUrl-${e}-${s}" class="lesson-videoUrl-input" value="${r}" placeholder="New video URL (optional)">
                ${n}
            </div>
            <div class="form-group"><label for="edit-${o}">Or Upload New Video File (Replaces existing video):</label><input type="file" id="edit-${o}" name="${o}" class="lesson-videoFile-input" accept="video/*"></div>
            <div class="form-group"><label for="edit-lesson-description-${e}-${s}">Description</label><textarea id="edit-lesson-description-${e}-${s}" class="lesson-description-input" rows="3">${a}</textarea></div>
            <div class="resources-container" id="edit-resources-container-${e}-${s}"><h6>Resources:</h6>${t.resources?t.resources.map((l,d)=>ke(e,s,d,l)).join(""):""}</div>
            <button type="button" class="add-resource-btn add-btn" data-section-index="${e}" data-lesson-index="${s}">+ Add Resource</button>
            <div class="quiz-container" id="edit-quiz-container-${e}-${s}"><h6>Quiz:</h6>${t.quiz?t.quiz.map((l,d)=>Se(e,s,d,l)).join(""):""}</div>
            <button type="button" class="add-quiz-question-btn add-btn" data-section-index="${e}" data-lesson-index="${s}">+ Add Quiz Question</button>
        </div>`}function ke(e,s,t,i={}){const r=i.name||"",a=i.url||"",o=`resource_s${e}_l${s}_r${t}_file`,n=a?`<p style="font-size:0.8em; margin-top:5px;">Current Resource: <a href="${a}" target="_blank" rel="noopener noreferrer">${a.substring(0,40)}...</a></p>`:'<p style="font-size:0.8em; margin-top:5px;">No current resource URL.</p>';return`
        <div class="resource-item" data-section-index="${e}" data-lesson-index="${s}" data-resource-index="${t}">
            <div class="resource-header"><p class="item-label">Resource ${t+1}</p><button type="button" class="remove-resource-btn remove-btn">X</button></div>
            <div class="form-group"><label for="edit-resource-name-${e}-${s}-${t}">Name</label><input type="text" id="edit-resource-name-${e}-${s}-${t}" class="resource-name-input" value="${r}" required></div>
            <div class="form-group">
                <label for="edit-resource-url-${e}-${s}-${t}">URL (Enter new to replace, or leave blank to keep current/use upload)</label>
                <input type="url" id="edit-resource-url-${e}-${s}-${t}" class="resource-url-input" value="${a}" placeholder="New resource URL (optional)">
                ${n}
            </div>
            <div class="form-group"><label for="edit-${o}">Or Upload New Resource File (Replaces existing resource):</label><input type="file" id="edit-${o}" name="${o}" class="resource-file-input"></div>
        </div>`}function Se(e,s,t,i={}){const r=i.questionText||"",a=i.options||["","","",""],o=i.correctAnswerIndex!==void 0?i.correctAnswerIndex:0;let n="";for(let c=0;c<4;c++)n+=`
            <div class="form-group">
                <label for="edit-quiz-option-${e}-${s}-${t}-${c}">Option ${c+1}</label>
                <input type="text" id="edit-quiz-option-${e}-${s}-${t}-${c}" required class="quiz-option-input" value="${a[c]||""}">
            </div>`;return`
        <div class="quiz-question-item" data-section-index="${e}" data-lesson-index="${s}" data-question-index="${t}">
            <div class="quiz-header"><p class="item-label">Question ${t+1}</p><button type="button" class="remove-quiz-question-btn remove-btn">X</button></div>
            <div class="form-group"><label for="edit-quiz-questionText-${e}-${s}-${t}">Question Text</label><textarea id="edit-quiz-questionText-${e}-${s}-${t}" required class="quiz-questionText-input" rows="2">${r}</textarea></div>
            ${n}
            <div class="form-group">
                <label for="edit-quiz-correctAnswer-${e}-${s}-${t}">Correct Answer</label>
                <select id="edit-quiz-correctAnswer-${e}-${s}-${t}" required class="quiz-correctAnswer-select">
                    <option value="0" ${o===0?"selected":""}>Option 1</option>
                    <option value="1" ${o===1?"selected":""}>Option 2</option>
                    <option value="2" ${o===2?"selected":""}>Option 3</option>
                    <option value="3" ${o===3?"selected":""}>Option 4</option>
                </select>
            </div>
        </div>`}function Xe(e={}){const s=document.getElementById("sections-container");if(s){const t=be(G,e);s.insertAdjacentHTML("beforeend",t),z[G.toString()]=e.lessons?e.lessons.length:0,G++}}function Ze(e,s){const t=e.closest(s);t&&t.remove()}function et(e,s={}){const t=e.dataset.sectionIndex,i=document.getElementById(`edit-lessons-container-${t}`);if(i){const r=t.toString();z[r]===void 0&&(z[r]=0);const a=z[r];i.insertAdjacentHTML("beforeend",we(t,a,s));const o=`${r}_${a}`;_[o]=s.resources?s.resources.length:0,U[o]=s.quiz?s.quiz.length:0,z[r]++}}function tt(e,s={}){const t=e.dataset.sectionIndex,i=e.dataset.lessonIndex,r=document.getElementById(`edit-resources-container-${t}-${i}`);if(r){const a=`${t}_${i}`;_[a]===void 0&&(_[a]=0);const o=_[a];r.insertAdjacentHTML("beforeend",ke(t,i,o,s)),_[a]++}}function st(e,s={}){const t=e.dataset.sectionIndex,i=e.dataset.lessonIndex,r=document.getElementById(`edit-quiz-container-${t}-${i}`);if(r){const a=`${t}_${i}`;U[a]===void 0&&(U[a]=0);const o=U[a];r.insertAdjacentHTML("beforeend",Se(t,i,o,s)),U[a]++}}async function Ce(e,s){var o,n;G=0,z={},_={},U={};let t=null,i=!0,r=null;try{const c={};s.token&&(c.Authorization=`Bearer ${s.token}`);const l=await fetch(`${$e}/${e}`,{headers:c});if(!l.ok)throw new Error(`HTTP error ${l.status}`);if(t=await l.json(),t.instructor!==s.user.userId&&s.user.role!=="admin")throw new Error("You are not authorized to edit this course.")}catch(c){r=c.message}finally{i=!1}if(i)return'<p class="loading-message">Loading course for editing...</p>';if(r)return`<p class="error-message">Error loading course: ${r}</p>`;if(!t)return'<p class="not-found">Course not found or could not be loaded.</p>';G=t.sections?t.sections.length:0,(o=t.sections)==null||o.forEach((c,l)=>{var d;z[l.toString()]=c.lessons?c.lessons.length:0,(d=c.lessons)==null||d.forEach((p,h)=>{const y=`${l}_${h}`;_[y]=p.resources?p.resources.length:0,U[y]=p.quiz?p.quiz.length:0})});const a=t.thumbnailUrl?`<p style="font-size:0.8em; margin-top:5px;">Current Thumbnail: <img src="${t.thumbnailUrl}" alt="Current Thumbnail" style="max-width:100px; max-height:60px; vertical-align:middle; margin-left:10px;"/></p>`:'<p style="font-size:0.8em; margin-top:5px;">No current thumbnail.</p>';return`
        <section class="create-course-form-container" aria-labelledby="edit-course-title-page">
            <h2 id="edit-course-title-page">Edit Course: ${t.title}</h2>
            <form id="edit-course-form" data-course-id="${e}" novalidate>
                <div id="edit-course-feedback" class="form-feedback" aria-live="assertive"></div>
                <fieldset><legend>Course Details</legend>
                    <div class="form-group"><label for="edit-course-title">Title</label><input type="text" id="edit-course-title" name="title" value="${t.title||""}" required></div>
                    <div class="form-group"><label for="edit-course-description">Description</label><textarea id="edit-course-description" name="description" rows="5" required>${t.description||""}</textarea></div>
                    <div class="form-group"><label for="edit-course-category">Category</label>
                        <select id="edit-course-category" name="category" required>
                            <option value="Programming" ${t.category==="Programming"?"selected":""}>Programming</option>
                            <option value="Design" ${t.category==="Design"?"selected":""}>Design</option>
                            <option value="Business" ${t.category==="Business"?"selected":""}>Business</option>
                            <option value="Data Science" ${t.category==="Data Science"?"selected":""}>Data Science</option>
                            <option value="Marketing" ${t.category==="Marketing"?"selected":""}>Marketing</option>
                            <option value="Personal Development" ${t.category==="Personal Development"?"selected":""}>Personal Development</option>
                            <option value="Other" ${t.category==="Other"?"selected":""}>Other</option>
                        </select>
                    </div>
                    <div class="form-group"><label for="edit-course-price">Price (USD)</label><input type="number" id="edit-course-price" name="price" min="0" step="0.01" value="${t.price!==void 0?t.price:""}" placeholder="0 for free"></div>
                    <div class="form-group">
                        <label for="edit-course-thumbnailImage">Upload New Thumbnail Image (Optional):</label>
                        <input type="file" id="edit-course-thumbnailImage" name="thumbnailImage" accept="image/*">
                        ${a}
                    </div>
                    <div class="form-group"><label for="edit-course-tags">Tags (comma-separated)</label><input type="text" id="edit-course-tags" name="tags" value="${((n=t.tags)==null?void 0:n.join(", "))||""}" placeholder="e.g., web, js, react"></div>
                </fieldset>
                <fieldset><legend>Course Content</legend>
                    <div id="sections-container">
                        ${t.sections?t.sections.map((c,l)=>be(l,c)).join(""):""}
                    </div>
                    <button type="button" id="add-section-btn" class="button-like secondary add-btn">+ Add Section</button>
                </fieldset>
                <button type="submit" class="accent button-like" style="width:100%; padding: 1rem;">Save Changes</button>
            </form>
        </section>`}async function Te(e,s){const t=document.getElementById("edit-course-feedback");t.textContent="Processing...",t.className="form-feedback processing",t.style.display="block";const i=localStorage.getItem("skillShareHubToken");if(!i){t.textContent="Authentication error.",t.className="form-feedback error";return}const r=new FormData;r.append("title",e.querySelector("#edit-course-title").value),r.append("description",e.querySelector("#edit-course-description").value),r.append("category",e.querySelector("#edit-course-category").value),r.append("price",e.querySelector("#edit-course-price").value||"0"),r.append("tags",e.querySelector("#edit-course-tags").value);const a=e.querySelector("#edit-course-thumbnailImage").files[0];a&&r.append("thumbnailImage",a);const o=[];if(e.querySelectorAll(".section-item").forEach((n,c)=>{const l=n.querySelector(".section-title-input");if(!l||!l.value.trim()){console.warn(`Skipping section ${c} with empty title in edit`);return}const d={title:l.value.trim(),lessons:[]};n.querySelectorAll(".lesson-item").forEach((p,h)=>{const y=p.querySelector(".lesson-title-input");if(!y||!y.value.trim()){console.warn(`Skipping lesson ${h} in section ${c} with empty title in edit`);return}const g={title:y.value.trim(),videoUrl:p.querySelector(".lesson-videoUrl-input").value.trim(),description:p.querySelector(".lesson-description-input").value.trim(),resources:[],quiz:[]},v=p.querySelector(".lesson-videoFile-input");v&&v.files[0]&&r.append(`lesson_s${c}_l${h}_videoFile`,v.files[0]),p.querySelectorAll(".resource-item").forEach((u,m)=>{const b=u.querySelector(".resource-name-input"),S=u.querySelector(".resource-url-input");if(b&&b.value.trim()){const w={name:b.value.trim(),url:S.value.trim()};g.resources.push(w);const k=u.querySelector(".resource-file-input");k&&k.files[0]&&r.append(`resource_s${c}_l${h}_r${m}_file`,k.files[0])}else console.warn(`Skipping resource S${c}L${h}R${m} due to empty name in edit.`)}),p.querySelectorAll(".quiz-question-item").forEach((u,m)=>{const b=u.querySelector(".quiz-questionText-input");if(!b||!b.value.trim()){console.warn(`Skipping quiz S${c}L${h}Q${m} due to empty text in edit.`);return}const S=[];let w=!0;for(let A=0;A<4;A++){const M=u.querySelector(`#edit-quiz-option-${c}-${h}-${m}-${A}`);M&&M.value.trim()?S.push(M.value.trim()):w=!1}if(!w||S.length!==4){console.warn(`Skipping quiz S${c}L${h}Q${m} due to incomplete options in edit.`);return}const k=u.querySelector(".quiz-correctAnswer-select"),L=k?parseInt(k.value):-1;if(L<0||L>3){console.warn(`Skipping quiz S${c}L${h}Q${m} due to invalid correct answer in edit.`);return}g.quiz.push({questionText:b.value.trim(),options:S,correctAnswerIndex:L})}),d.lessons.push(g)}),o.push(d)}),r.append("sections",JSON.stringify(o)),!r.get("title")||!r.get("description")||!r.get("category")){t.textContent="Title, Description, and Category are required.",t.className="form-feedback error";return}try{const n=await fetch(`${$e}/${s}`,{method:"PUT",headers:{Authorization:`Bearer ${i}`},body:r}),c=await n.json();if(!n.ok)throw new Error(c.message||`HTTP error ${n.status}`);t.textContent="Course updated successfully!",t.className="form-feedback success",setTimeout(()=>{window.location.hash=`#course-view/${s}`},1500)}catch(n){console.error("Error updating course:",n),t.textContent=n.message||"Failed to update course.",t.className="form-feedback error"}}const rt=Object.freeze(Object.defineProperty({__proto__:null,addLesson:et,addQuizQuestion:st,addResource:tt,addSection:Xe,handleEditCourseFormSubmit:Te,removeElement:Ze,renderEditCourseForm:Ce},Symbol.toStringTag,{value:"Module"}));/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/function it(e){return`
        <div class="review-form-container">
            <h4>Write a Review</h4>
            <form id="submit-review-form" data-course-id="${e}">
                <div id="review-form-feedback-${e}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                <div class="form-group">
                    <label for="review-rating-${e}">Rating:</label>
                    <select id="review-rating-${e}" name="rating" required>
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Fair)</option>
                        <option value="1">1 Star (Poor)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="review-text-${e}">Your Review:</label>
                    <textarea id="review-text-${e}" name="reviewText" rows="4" required></textarea>
                </div>
                <button type="submit" class="button-like primary">Submit Review</button>
            </form>
        </div>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const at="http://localhost:3001/api/courses";async function ot(e,s){var ce;let t=null,i=!0,r=null;const a=s.isAuthenticated?s.token:null;try{const $={};a&&($.Authorization=`Bearer ${a}`);const C=await fetch(`${at}/${e}`,{headers:$});if(!C.ok){if(C.status===404)throw new Error("Course not found.");const I=await C.json().catch(()=>({message:"Failed to parse server error."}));throw new Error(I.message||`HTTP error ${C.status}`)}t=await C.json()}catch($){r=$.message}finally{i=!1}if(i)return`<section id="course-view-${e}" class="course-view-section"><p class="loading-message">Loading course details...</p></section>`;if(r)return`<section id="course-view-${e}" class="course-view-section"><p class="error-message">Error: ${r}</p></section>`;if(!t)return`<section id="course-view-${e}" class="course-view-section"><p class="not-found">Course details could not be loaded.</p></section>`;const{title:o,description:n,instructor:c,instructorName:l,category:d,price:p,thumbnailUrl:h,tags:y,reviews:g,sections:v,enrollment:u}=t,m=s.isAuthenticated&&s.user&&(s.user.role==="instructor"||s.user.role==="admin")&&s.user.userId===c,b=p>0?`$${p.toFixed(2)}`:"Free",S="https://via.placeholder.com/600x300.png?text=Course+Image",w=u&&u.status==="enrolled",k=u&&u.status==="completed",L=u&&u.status==="pending_payment",A=u&&u.progress&&u.progress.completedItems?new Set(u.progress.completedItems):new Set,M=u&&u.progress?u.progress.percentage:0;let te=!1;s.isAuthenticated&&s.user&&g&&Array.isArray(g)&&(te=g.some($=>$.userId===s.user.userId));let O="";m?O=`<a href="#edit-course/${e}" class="button-like accent">Edit Course</a>`:k?O=`<button class="button-like accent" disabled>Course Completed!</button>
                           <a href="${`/#mock-certificate/${e}/${(ce=s.user)==null?void 0:ce.userId}`}" class="button-like secondary view-certificate-btn">View Certificate</a>`:w?O=`<button class="button-like accent" disabled>Enrolled</button>
                           <a href="#course-content-${e}" class="button-like secondary">Continue Learning</a>`:L?O=`<a href="#payment/${e}?enrollmentId=${u.id}" class="button-like warning">Complete Payment</a>`:O=`<button class="enroll-now-btn button-like primary" data-course-id="${e}" data-course-price="${p}">Enroll Now</button>`;let W='<p class="enroll-prompt">Please enroll in the course to access the curriculum and track your progress.</p>';m||w||k?v&&v.length>0?W=`<ul>${v.map(($,C)=>{let I="<p>No lessons in this section.</p>";return $.lessons&&$.lessons.length>0&&(I=`<ul>${$.lessons.map((T,R)=>{const J=`s${C}_l${R}_content`,Y=A.has(J),Ne=`s${C}_l${R}_quiz`,Re=A.has(Ne);let se="";T.quiz&&T.quiz.length>0&&(m?se=`<div class="quiz-section-cv"><h5>Lesson Quiz (Owner Preview)</h5>
                                    ${T.quiz.map((F,D)=>`
                                        <div class="quiz-question-cv" data-question-index="${D}">
                                            <p>${D+1}. ${F.questionText}</p>
                                            <ul class="quiz-options-preview">
                                                ${F.options.map((ie,Q)=>`
                                                    <li class="${Q===F.correctAnswerIndex?"correct-answer-preview":""}">${ie} ${Q===F.correctAnswerIndex?"<strong>(Correct)</strong>":""}</li>
                                                `).join("")}
                                            </ul>
                                        </div>`).join("")}
                                </div>`:Y&&(w||k)&&(se=`<div class="quiz-section-cv"><h5>Lesson Quiz</h5>
                                    ${Re?'<p class="quiz-feedback success">Quiz Completed!</p>':`
                                    <form class="quiz-form" data-course-id="${e}" data-section-index="${C}" data-lesson-index="${R}" data-enrollment-id="${u==null?void 0:u.id}">
                                        ${T.quiz.map((F,D)=>`
                                            <div class="quiz-question-cv" data-question-index="${D}">
                                                <p>${D+1}. ${F.questionText}</p>
                                                <div class="quiz-options-cv">
                                                    ${F.options.map((ie,Q)=>`
                                                        <label for="q${D}-opt${Q}-${e}-s${C}-l${R}">
                                                            <input type="radio" id="q${D}-opt${Q}-${e}-s${C}-l${R}" name="q${D}_s${C}_l${R}" value="${Q}" required> ${ie}
                                                        </label>`).join("")}
                                                </div>
                                            </div>`).join("")}
                                        <button type="submit" class="button-like primary">Submit Quiz</button>
                                        <div class="quiz-feedback" style="display:none;"></div>
                                    </form>
                                    `}
                                </div>`));let re="";!m&&u&&(w||k)&&(w&&!k?re=`
                                <span class="progress-marker">
                                    <input type="checkbox" class="progress-item-checkbox"
                                           id="complete-${J}"
                                           data-item-id="${J}"
                                           data-enrollment-id="${u.id}"
                                           data-course-id="${e}"
                                           ${Y?"checked disabled":""}>
                                    <label for="complete-${J}" class="${Y?"completed-item-text":""}">${Y?"✔️ Completed":"Mark as complete"}</label>
                                </span>`:Y&&(re='<span class="completed-item-text accent-text">✔️ Completed</span>'));const Pe=T.videoUrl?`<button class="watch-video-btn button-like secondary small-btn"
                                    data-video-url="${T.videoUrl}"
                                    data-lesson-title="${T.title}"
                                    data-course-id="${e}"
                                    data-section-index="${C}"
                                    data-lesson-index="${R}">Watch Video</button>`:"";return`<li>
                                    <div class="lesson-header-cv">
                                        <h5>${T.title}</h5>
                                        ${re}
                                    </div>
                                    ${T.description?`<p>${T.description.replace(/\n/g,"<br>")}</p>`:""}
                                    ${Pe}
                                    ${T.resources&&T.resources.length>0?`<h6>Resources:</h6><ul>${T.resources.map(F=>`<li><a href="${F.url}" target="_blank" rel="noopener noreferrer">${F.name}</a></li>`).join("")}</ul>`:""}
                                    ${se}
                                </li>`}).join("")}</ul>`),`<li><h4>${$.title}</h4>${I}</li>`}).join("")}</ul>`:W="<p>Curriculum details are not yet available for this course.</p>":L&&(W=`<p class="enroll-prompt">Your enrollment is pending. Please <a href="#payment/${e}?enrollmentId=${u.id}">complete your payment</a> to access the course content.</p>`);const Fe=g&&g.length>0?`<ul>${g.map($=>{const C=s.isAuthenticated&&s.user&&(m||s.user.role==="admin"),I=$.isFlagged?"Unflag Review":"Flag Review",T=$.isFlagged?"secondary":"warning",R=$.isFlagged?'<span class="review-flag-indicator" data-flagged="true">🚩 Flagged</span>':"";return`<li>
                    <strong>${$.reviewerName||"Anonymous"}</strong> - ${"⭐".repeat($.rating)}(${$.rating}/5) ${R}
                    <p>${$.reviewText}</p>
                    <small>${new Date($.date||$.createdAt).toLocaleDateString()}</small>
                    ${C?`<button class="flag-review-btn button-like ${T} small-btn"
                                        data-course-id="${e}"
                                        data-review-id="${$.id}"
                                        data-current-flag-status="${$.isFlagged}">
                                    ${I}
                                 </button>`:""}
                </li>`}).join("")}</ul>`:"<p>No reviews yet.</p>";return`
        <section id="course-view-${e}" class="course-view-section" aria-labelledby="cv-title-${e}">
            <div class="course-header-cv">
                <img src="${h||S}" alt="${o}" class="course-thumbnail-cv">
                <div class="course-meta-cv">
                    <h2 id="cv-title-${e}">${o}</h2>
                    <p class="instructor-cv">By: ${l||"Unknown"}</p>
                    <p class="category-cv">Category: ${d}</p>
                    <p class="price-cv">${b}</p>
                    <p class="tags-cv">Tags: ${(y==null?void 0:y.join(", "))||"N/A"}</p>
                    <div id="cv-enroll-feedback-${e}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                    ${O}
                    ${(w||k)&&u&&!m?`<div style="margin-top:10px;"><label for="overall-progress-${e}">Overall Progress:</label><progress id="overall-progress-${e}" value="${M}" max="100" style="width:100%;"></progress><span>${M}%</span></div>`:""}
                </div>
            </div>
            <div class="course-content-cv">
                <h3>About this course</h3>
                <p>${n.replace(/\n/g,"<br>")}</p>
                <h3 id="course-content-${e}">Course Curriculum</h3>
                ${W}
            </div>
            <div class="course-reviews-cv">
                <h3>Reviews (${(g==null?void 0:g.length)||0})</h3>
                <div id="review-flag-feedback-${e}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                ${Fe}
                ${s.isAuthenticated&&(w||k)&&!te&&!m?it(e):""}
                ${s.isAuthenticated&&(w||k)&&te&&!m?"<p>You have already reviewed this course.</p>":""}
                ${!s.isAuthenticated&&!m?'<p><a href="#login">Login</a> to enroll and write a review.</p>':""}
                ${s.isAuthenticated&&!(w||k)&&!L&&!m?"<p>Enroll in this course to write a review.</p>":""}
            </div>
        </section>
        <div id="video-player-modal-container" aria-live="assertive" style="display:none;"></div>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const nt="http://localhost:3001/api/instructor";async function ne(e,s,t){try{const i=await fetch(`${nt}${e}`,{headers:{Authorization:`Bearer ${s}`}});if(!i.ok){const r=await i.json().catch(()=>({}));throw new Error(r.message||`HTTP error ${i.status} for ${t}`)}return await i.json()}catch(i){return console.error(`Error fetching instructor ${t} data:`,i),null}}async function lt(e){var c,l;if(!e||!e.isAuthenticated||((c=e.user)==null?void 0:c.role)!=="instructor"&&((l=e.user)==null?void 0:l.role)!=="admin")return'<p class="error-message">Access Denied. You must be an instructor or admin to view this page.</p>';const s=e.token;let t='<p class="loading-message">Loading summary...</p>',i='<p class="loading-message">Loading enrollments...</p>',r='<p class="loading-message">Loading reviews...</p>';const[a,o,n]=await Promise.all([ne("/dashboard-summary",s,"summary"),ne("/enrollments",s,"enrollments"),ne("/reviews",s,"reviews")]);return a?t=`
            <div class="analytics-summary-grid">
                <div class="analytics-summary-card"><h4>Total Courses</h4><p>${a.totalCourses}</p></div>
                <div class="analytics-summary-card"><h4>Total Enrollments</h4><p>${a.totalEnrollments}</p></div>
                <div class="analytics-summary-card"><h4>Total Revenue</h4><p>$${(a.totalRevenue||0).toFixed(2)}</p></div>
                <div class="analytics-summary-card"><h4>Average Rating</h4><p>${a.averageRating||"N/A"} ⭐</p></div>
            </div>
        `:t='<p class="error-message">Could not load summary data.</p>',o?o.length>0?i=`
                <div class="admin-course-moderation-list"> <!-- Reusing styles for grid -->
                    <div class="admin-course-moderation-header" style="grid-template-columns: 2fr 2fr 1fr;">
                        <span>Course Title</span>
                        <span>Enrolled User</span>
                        <span style="text-align:center;">Completion</span>
                    </div>
                    ${o.map(d=>`
                        <div class="admin-course-moderation-item" style="grid-template-columns: 2fr 2fr 1fr;">
                            <span class="cm-course-name" data-label="Course: ">${d.courseTitle}</span>
                            <span class="cm-instructor" data-label="User: ">${d.userName}<br><small>${d.userEmail}</small></span>
                            <span class="cm-flagged" data-label="Completion: " style="text-align:center;">${d.progressPercentage}% (${d.enrollmentStatus})</span>
                        </div>
                    `).join("")}
                </div>`:i="<p>No enrollments found for your courses.</p>":i='<p class="error-message">Could not load enrollment data.</p>',n?n.length>0?r=`
                <ul class="instructor-review-list"> <!-- Custom or adapted styles for reviews -->
                    ${n.map(d=>`
                        <li class="admin-review-item"> <!-- Reusing admin-review-item structure -->
                            <div class="review-item-content">
                                <p><strong>Review for "${d.courseTitle||"N/A"}":</strong></p>
                                <p>${d.reviewText}</p>
                            </div>
                            <div class="review-item-meta">
                                <p><strong>By:</strong> ${d.userName||"N/A"}</p>
                                <p><strong>Rating:</strong> ${"⭐".repeat(d.rating)} (${d.rating}/5)</p>
                                <p><strong>Date:</strong> ${new Date(d.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span class="admin-review-flag-status" data-flagged="${d.isFlagged}">${d.isFlagged?"🚩 Flagged":"🟢 Clear"}</span></p>
                            </div>
                            <div class="review-item-actions">
                                <button class="button-like ${d.isFlagged?"secondary":"warning"} instructor-flag-review-btn"
                                        data-course-id="${d.courseId}"
                                        data-review-id="${d.reviewId}"
                                        data-current-flag-status="${d.isFlagged}">
                                    ${d.isFlagged?"Unflag Review":"Flag Review"}
                                </button>
                            </div>
                        </li>
                    `).join("")}
                </ul>`:r="<p>No reviews found for your courses.</p>":r='<p class="error-message">Could not load review data.</p>',`
        <section id="instructor-analytics" class="instructor-analytics-section" aria-labelledby="instructor-analytics-title">
            <h2 id="instructor-analytics-title">Detailed Instructor Analytics</h2>
            
            <h3>Performance Summary</h3>
            ${t}

            <h3>Course Enrollment Management</h3>
            ${i}
            
            <h3>Review Management</h3>
            <div id="instructor-review-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${r}
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const ct="http://localhost:3001/api/courses";async function dt(e,s,t){let i="this course",r="Valued Learner",a=new Date().toLocaleDateString(),o=!0,n=null;if(!t.isAuthenticated||!t.user)return'<section class="certificate-page-container"><p class="error-message">Please log in to view certificates.</p><p><a href="#login" class="button-like">Login</a></p></section>';t.user.userId===s||t.user.role==="admin"?r=t.user.name:console.warn(`Certificate view attempt for user ${s} by user ${t.user.userId}. Displaying generic name if not owner/admin.`);try{const c={};t.token&&(c.Authorization=`Bearer ${t.token}`);const l=await fetch(`${ct}/${e}`,{headers:c});if(!l.ok){const p=await l.json().catch(()=>({}));throw new Error(p.message||`Could not fetch course details (status ${l.status})`)}const d=await l.json();d&&d.title&&(i=d.title)}catch(c){console.error("Error fetching data for certificate:",c),n=c.message}finally{o=!1}return o?'<section class="certificate-page-container"><p class="loading-message">Loading certificate...</p></section>':n?`<section class="certificate-page-container"><p class="error-message">Could not load certificate: ${n}</p></section>`:`
        <section class="certificate-page-container" aria-labelledby="certificate-main-title">
            <div class="certificate-frame">
                <header class="certificate-header">
                    <h1>🎓 SkillShareHub</h1>
                    <p><em>Platform for Sharing and Gaining Skills</em></p>
                </header>
                <div class="certificate-body">
                    <h2 id="certificate-main-title" class="certificate-title">Certificate of Completion</h2>
                    <p class="certificate-statement presented-to">This certificate is proudly presented to</p>
                    <p class="certificate-recipient-name">${r}</p>
                    <p class="certificate-statement">for successfully completing the course</p>
                    <p class="certificate-course-name">"${i}"</p>
                    <p class="certificate-date">Date of Completion: ${a}</p>
                </div>
                <footer class="certificate-footer">
                    <div class="certificate-signature-placeholder">
                        <p>_________________________</p>
                        <p>Authorized Signature</p>
                    </div>
                    <p class="certificate-platform-name">SkillShareHub Learning Platform</p>
                </footer>
            </div>
             <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" class="button-like primary">Print Certificate</button>
                <a href="#my-learning" class="button-like secondary">Back to Dashboard</a>
            </div>
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const ut="http://localhost:3001/api/courses";async function pt(e,s,t){if(!t.isAuthenticated)return'<p class="error-message">Please <a href="#login">login</a> to proceed with payment.</p>';if(!s)return console.error("Payment page loaded without enrollmentId."),setTimeout(()=>{window.location.hash=`#course-view/${e}`},0),'<p class="error-message">Invalid payment session. Please try enrolling again from the course page.</p>';let i;try{const a={};t.token&&(a.Authorization=`Bearer ${t.token}`);const o=await fetch(`${ut}/${e}`,{headers:a});if(!o.ok){const n=await o.json().catch(()=>({}));throw new Error(n.message||`Could not fetch course details (status ${o.status})`)}i=await o.json()}catch(a){return console.error("Error fetching course details for payment page:",a),`<section class="payment-page-container-paypal"><p class="error-message">Error loading course details: ${a.message}</p></section>`}if(!i||i.price===void 0)return'<section class="payment-page-container-paypal"><p class="error-message">Could not determine course price.</p></section>';const r=parseFloat(i.price);return r===0?(setTimeout(()=>{window.location.hash=`#course-view/${e}`},0),'<p class="loading-message">This is a free course, redirecting...</p>'):`
        <section class="payment-page-container-paypal" aria-labelledby="payment-page-title">
            <div id="payment-form-area"> 
                <header class="paypal-header">
                    <h2 id="payment-page-title">SkillShareHub Secure Checkout</h2>
                </header>
                <div class="paypal-order-summary">
                    <h3>Order Summary</h3>
                    <p><strong>Item:</strong> ${i.title}</p>
                    <p><strong>Price:</strong> <span class="price-display">$${r.toFixed(2)}</span></p>
                </div>
                <form id="payment-form" 
                      data-course-id="${e}" 
                      data-course-name="${i.title}" 
                      data-expected-price="${r.toFixed(2)}"
                      data-enrollment-id="${s}"> {/* Pass enrollmentId to the form handler */}
                    <div id="payment-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                    <p class="payment-disclaimer"><em>You will be enrolled upon clicking 'Pay Now'. This is a simulated payment.</em></p>
                    <button type="submit" class="paypal-like-button">Pay Now $${r.toFixed(2)}</button>
                </form>
                <footer class="paypal-footer-mock">
                    <p>Secured by SkillShareHub | <a href="#privacy" target="_blank">Privacy</a> | <a href="#legal" target="_blank">Legal</a></p>
                </footer>
            </div>
        </section>
    `}/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/const B=document.getElementById("app-container"),q="http://localhost:3001";let f={isAuthenticated:!1,user:null,token:null},K=null,N=null,P=null,V=null;function mt(){const e=localStorage.getItem("skillShareHubToken"),s=localStorage.getItem("skillShareHubUser");if(e&&s)try{const t=JSON.parse(s);if(t&&t.userId&&t.name&&t.email&&t.role)f={isAuthenticated:!0,user:t,token:e};else throw new Error("Invalid user object in localStorage")}catch(t){console.error("Error parsing user from localStorage or invalid user object:",t),localStorage.removeItem("skillShareHubToken"),localStorage.removeItem("skillShareHubUser"),f={isAuthenticated:!1,user:null,token:null}}}function qe(e){f=e,e.isAuthenticated&&e.token&&e.user?(localStorage.setItem("skillShareHubToken",e.token),localStorage.setItem("skillShareHubUser",JSON.stringify(e.user))):(localStorage.removeItem("skillShareHubToken"),localStorage.removeItem("skillShareHubUser")),ee()}function ft(){const e=window.location.hash.indexOf("?");if(window.location.hash.startsWith("#oauth_callback")&&e!==-1){const s=window.location.hash.substring(e+1),t=new URLSearchParams(s),i=t.get("token"),r=t.get("user");if(i&&r)try{const a=JSON.parse(decodeURIComponent(r));qe({isAuthenticated:!0,user:a,token:i});let o="#my-learning";return a.role==="instructor"?o="#instructor-panel":a.role==="admin"&&(o="#admin-panel"),window.location.hash=o,!0}catch(a){return console.error("OAuth Callback Error - Could not parse user data:",a),window.location.hash="#login?oauth_error=parsing_failed",!0}else return console.warn("OAuth callback detected but token or user data is missing."),window.location.hash="#login?oauth_error=missing_data",!0}return!1}function ee(){if(!B){console.error("App container #app-container not found!");return}B.innerHTML=`
        ${X(f)}
        <main id="main-content" aria-live="polite"></main>
        ${ve()}
    `,j()}async function j(){var o,n,c,l,d,p,h,y,g,v,u;const e=document.getElementById("main-content");if(!e){B&&ee();return}const s=window.location.hash.split("?")[0]||"#home",t=new URLSearchParams(window.location.hash.split("?")[1]||"");if(e.innerHTML='<p class="loading-message">Loading page...</p>',(["#user-dashboard","#my-learning","#instructor-dashboard","#instructor-panel","#admin-panel","#create-course","#instructor-analytics"].includes(s)||s.startsWith("#edit-course/"))&&!f.isAuthenticated&&!s.startsWith("#mock-certificate/")){window.location.hash="#login";return}if(s.startsWith("#payment/")&&!f.isAuthenticated){window.location.hash="#login";return}if(s==="#logout"){localStorage.removeItem("skillShareHubToken"),localStorage.removeItem("skillShareHubUser"),f={isAuthenticated:!1,user:null,token:null};const m=document.querySelector("header");m?m.outerHTML=X(f):B&&(B.innerHTML=`
                ${X(f)}
                <main id="main-content" aria-live="polite"><p class="loading-message">Redirecting...</p></main>
                ${ve()}
            `),window.location.hash="#home";return}let r="",a="SkillShareHub";if(s.startsWith("#course-view/")){const m=s.substring(13);r=await ot(m,f),a="View Course - SkillShareHub"}else if(s.startsWith("#edit-course/")){const m=s.substring(13);((o=f.user)==null?void 0:o.role)!=="instructor"&&((n=f.user)==null?void 0:n.role)!=="admin"?r='<section class="not-found"><h2>Access Denied</h2><p>You must be an instructor or admin to edit courses.</p><a href="#home">Go to Homepage</a></section>':r=await Ce(m,f),a="Edit Course - SkillShareHub"}else if(s.startsWith("#mock-certificate/")){const m=s.substring(18).split("/"),b=m[0],S=m[1];b&&S?(r=await dt(b,S,f),a="Certificate of Completion - SkillShareHub"):(r='<p class="error-message">Invalid certificate link format.</p>',a="Invalid Link - SkillShareHub")}else if(s.startsWith("#payment/")){const m=s.substring(9),b=t.get("enrollmentId");m?(r=await pt(m,b,f),a="Complete Enrollment - SkillShareHub"):(r='<p class="error-message">Invalid payment link: Course ID missing.</p>',a="Error - SkillShareHub")}else switch(s){case"#home":case"#courses":const m=new URLSearchParams(window.location.search);r=Be(m)+await _e(m),a="Course Home - SkillShareHub";break;case"#login":if(f.isAuthenticated){window.location.hash="#home";return}r=ue("login"),a="Login - SkillShareHub";break;case"#signup":if(f.isAuthenticated){window.location.hash="#home";return}r=ue("signup"),a="Sign Up - SkillShareHub";break;case"#user-dashboard":r=await me(f.user,"My Dashboard"),a="My Dashboard - SkillShareHub";break;case"#my-learning":r=await me(f.user,"My Learning"),a="My Learning - SkillShareHub";break;case"#instructor-dashboard":((c=f.user)==null?void 0:c.role)!=="instructor"&&((l=f.user)==null?void 0:l.role)!=="admin"?r='<p class="error-message">Access Denied.</p>':r=await ge(f,"Instructor Dashboard"),a="Instructor Dashboard - SkillShareHub";break;case"#instructor-panel":((d=f.user)==null?void 0:d.role)!=="instructor"&&((p=f.user)==null?void 0:p.role)!=="admin"?r='<p class="error-message">Access Denied.</p>':r=await ge(f,"Instructor Panel"),a="Instructor Panel - SkillShareHub";break;case"#admin-panel":((h=f.user)==null?void 0:h.role)!=="admin"?r='<p class="error-message">Access Denied.</p>':r=await Ee(f),a="Admin Panel - SkillShareHub";break;case"#create-course":((y=f.user)==null?void 0:y.role)!=="instructor"&&((g=f.user)==null?void 0:g.role)!=="admin"?r='<section class="not-found"><h2>Access Denied</h2><p>You must be an instructor or admin to create courses.</p><a href="#home">Go to Homepage</a></section>':r=he(),a="Create Course - SkillShareHub";break;case"#instructor-analytics":((v=f.user)==null?void 0:v.role)!=="instructor"&&((u=f.user)==null?void 0:u.role)!=="admin"?r='<p class="error-message">Access Denied.</p>':r=await lt(f),a="Instructor Analytics - SkillShareHub";break;default:s.startsWith("#oauth_callback")?r='<p class="loading-message">Processing authentication...</p>':(r='<section class="not-found"><h2>Page Not Found</h2><p>Sorry, the page you are looking for does not exist.</p><a href="#home">Go to Homepage</a></section>',a="Page Not Found - SkillShareHub")}e.innerHTML=r,document.title=a,qt()}async function gt(e){const s=e.dataset.userId,t=e.dataset.userName||"this user",i=e.dataset.userEmail||"",r=document.getElementById("admin-user-action-feedback");if(!s){r&&(r.textContent="Error: User ID missing for deletion.",r.className="form-feedback error",r.style.display="block");return}if(window.confirm(`Are you sure you want to delete the user ${t} (${i})? This action cannot be undone.`)){r&&(r.textContent="Deleting user...",r.className="form-feedback processing",r.style.display="block");try{const a=await fetch(`${q}/api/admin/users/${s}`,{method:"DELETE",headers:{Authorization:`Bearer ${f.token}`}}),o=await a.json();if(!a.ok)throw new Error(o.message||`Failed to delete user (status ${a.status})`);r&&(r.textContent=o.message||`User ${t} deleted successfully. Page will refresh.`,r.className="form-feedback success"),j(),setTimeout(()=>{r&&(r.style.display="none")},3e3)}catch(a){console.error("Error deleting user:",a),r&&(r.textContent=a.message||"An error occurred while deleting the user.",r.className="form-feedback error")}}}async function vt(e){const s=e.dataset.userId,t=e.dataset.userName||"this user",r=e.dataset.isBlocked==="true"?"unblock":"block",a=document.getElementById("admin-user-action-feedback");if(!s){a&&(a.textContent="Error: User ID missing for action.",a.className="form-feedback error",a.style.display="block");return}if(window.confirm(`Are you sure you want to ${r} the user ${t}?`)){a&&(a.textContent=`${r==="block"?"Blocking":"Unblocking"} user...`,a.className="form-feedback processing",a.style.display="block");try{const o=await fetch(`${q}/api/admin/users/${s}/toggle-block`,{method:"PUT",headers:{Authorization:`Bearer ${f.token}`,"Content-Type":"application/json"}}),n=await o.json();if(!o.ok)throw new Error(n.message||`Failed to ${r} user (status ${o.status})`);a&&(a.textContent=n.message||`User ${t} ${r}ed successfully.`,a.className="form-feedback success");const c=n.isBlocked;e.textContent=c?"Unblock":"Block",e.dataset.isBlocked=c.toString(),e.classList.toggle("warning",!c),e.classList.toggle("secondary",c);const l=e.closest(".admin-user-management-item");if(l){const d=l.querySelector(".um-status");d&&(d.innerHTML=c?"🔴 Blocked":"🟢 Active")}setTimeout(()=>{a&&(a.style.display="none")},3e3)}catch(o){console.error(`Error ${r}ing user:`,o),a&&(a.textContent=o.message||`An error occurred while ${r}ing the user.`,a.className="form-feedback error")}}}async function ht(e){var r;const s=e.dataset.courseId,t=e.dataset.courseTitle||"this course",i=document.getElementById("admin-content-action-feedback");if(!s){i&&(i.textContent="Error: Course ID missing for deletion.",i.className="form-feedback error",i.style.display="block");return}if(window.confirm(`Are you sure you want to delete the course "${t}"? This will also remove all associated enrollments, reviews, and certificates. This action cannot be undone.`)){i&&(i.textContent="Deleting course...",i.className="form-feedback processing",i.style.display="block");try{const a=await fetch(`${q}/api/admin/courses/${s}`,{method:"DELETE",headers:{Authorization:`Bearer ${f.token}`}}),o=await a.json();if(!a.ok)throw new Error(o.message||`Failed to delete course (status ${a.status})`);i&&(i.textContent=o.message||`Course "${t}" deleted successfully.`,i.className="form-feedback success"),(r=e.closest(".admin-course-moderation-item"))==null||r.remove();const n=document.getElementById("admin-active-courses-metric");if(n){const c=parseInt(n.textContent);!isNaN(c)&&c>0&&(n.textContent=(c-1).toString())}setTimeout(()=>{i&&(i.style.display="none")},3e3)}catch(a){console.error("Error deleting course:",a),i&&(i.textContent=a.message||"An error occurred while deleting the course.",i.className="form-feedback error")}}}async function yt(e){var r;const s=e.dataset.reviewId,t=e.dataset.reviewText||"this review",i=document.getElementById("admin-review-action-feedback");if(!s){i&&(i.textContent="Error: Review ID missing for deletion.",i.className="form-feedback error",i.style.display="block");return}if(window.confirm(`Are you sure you want to delete the review: "${t}"? This action cannot be undone.`)){i&&(i.textContent="Deleting review...",i.className="form-feedback processing",i.style.display="block");try{const a=await fetch(`${q}/api/admin/reviews/${s}`,{method:"DELETE",headers:{Authorization:`Bearer ${f.token}`}}),o=await a.json();if(!a.ok)throw new Error(o.message||`Failed to delete review (status ${a.status})`);i&&(i.textContent=o.message||"Review deleted successfully.",i.className="form-feedback success"),(r=e.closest(".admin-review-item"))==null||r.remove(),setTimeout(()=>{i&&(i.style.display="none")},3e3)}catch(a){console.error("Error deleting review:",a),i&&(i.textContent=a.message||"An error occurred while deleting the review.",i.className="form-feedback error")}}}async function $t(e){const s=e.dataset.courseId,t=e.dataset.reviewId,r=e.dataset.currentFlagStatus==="true"?"unflag":"flag",a=document.getElementById("instructor-review-feedback");if(!s||!t){a&&(a.textContent="Error: Course or Review ID missing.",a.className="form-feedback error",a.style.display="block");return}if(window.confirm(`Are you sure you want to ${r} this review?`)){a&&(a.textContent=`${r==="flag"?"Flagging":"Unflagging"} review...`,a.className="form-feedback processing",a.style.display="block");try{const o=await fetch(`${q}/api/courses/${s}/reviews/${t}/toggle-flag`,{method:"PUT",headers:{Authorization:`Bearer ${f.token}`,"Content-Type":"application/json"}}),n=await o.json();if(!o.ok)throw new Error(n.message||`Failed to ${r} review.`);a&&(a.textContent=n.message||`Review ${r}ged successfully.`,a.className="form-feedback success");const c=e.closest(".admin-review-item");if(c){const l=n.review.isFlagged;e.textContent=l?"Unflag Review":"Flag Review",e.dataset.currentFlagStatus=l.toString(),e.classList.toggle("warning",!l),e.classList.toggle("secondary",l);const d=c.querySelector(".review-flag-indicator");d&&(d.innerHTML=l?"🚩 Flagged":'<span style="color:green;">🟢 Clear</span>',d.dataset.flagged=l.toString())}setTimeout(()=>{a&&(a.style.display="none")},3e3)}catch(o){console.error(`Error ${r}ging review:`,o),a&&(a.textContent=o.message||"An error occurred.",a.className="form-feedback error")}}}function bt(e){const s=e.closest(".admin-review-item");if(!s)return;const t=s.querySelector(".review-text-display"),i=s.querySelector(".review-edit-mode"),r=s.querySelector(".admin-edit-review-btn"),a=s.querySelector(".admin-save-review-btn"),o=s.querySelector(".admin-cancel-edit-review-btn"),n=s.querySelector(".admin-delete-review-btn"),c=s.querySelector(".admin-toggle-flag-review-btn"),l=s.querySelector(".review-edit-area"),d=s.querySelector(".editable-review-text");l&&d&&(l.value=d.textContent),t.style.display="none",i.style.display="block",r&&(r.style.display="none"),n&&(n.style.display="none"),c&&(c.style.display="none"),a&&(a.style.display="inline-block"),o&&(o.style.display="inline-block")}async function wt(e){const s=e.closest(".admin-review-item"),t=s.dataset.reviewId,r=s.querySelector(".review-edit-area").value.trim(),a=document.getElementById("admin-review-action-feedback");if(!r){a&&(a.textContent="Review text cannot be empty.",a.className="form-feedback error",a.style.display="block");return}a&&(a.textContent="Saving review...",a.className="form-feedback processing",a.style.display="block");try{const o=await fetch(`${q}/api/admin/reviews/${t}/edit`,{method:"PUT",headers:{Authorization:`Bearer ${f.token}`,"Content-Type":"application/json"},body:JSON.stringify({reviewText:r})}),n=await o.json();if(!o.ok)throw new Error(n.message||"Failed to save review.");a&&(a.textContent=n.message||"Review saved successfully.",a.className="form-feedback success");const c=s.querySelector(".editable-review-text");c&&(c.textContent=r),Le(e),setTimeout(()=>{a&&(a.style.display="none")},3e3)}catch(o){console.error("Error saving review:",o),a&&(a.textContent=o.message||"An error occurred while saving the review.",a.className="form-feedback error")}}function Le(e){const s=e.closest(".admin-review-item");if(!s)return;const t=s.querySelector(".review-text-display"),i=s.querySelector(".review-edit-mode"),r=s.querySelector(".admin-edit-review-btn"),a=s.querySelector(".admin-save-review-btn"),o=s.querySelector(".admin-cancel-edit-review-btn"),n=s.querySelector(".admin-delete-review-btn"),c=s.querySelector(".admin-toggle-flag-review-btn");t.style.display="block",i.style.display="none",r&&(r.style.display="inline-block"),n&&(n.style.display="inline-block"),c&&(c.style.display="inline-block"),a&&(a.style.display="none"),o&&(o.style.display="none");const l=document.getElementById("admin-review-action-feedback");l&&l.className.includes("error")}async function kt(e){const s=e.dataset.reviewId,i=e.dataset.currentFlagStatus==="true"?"unflag":"flag",r=document.getElementById("admin-review-action-feedback");if(!s){r&&(r.textContent="Error: Review ID missing.",r.className="form-feedback error",r.style.display="block");return}if(window.confirm(`Are you sure you want to ${i} this review?`)){r&&(r.textContent=`${i==="flag"?"Flagging":"Unflagging"} review...`,r.className="form-feedback processing",r.style.display="block");try{const a=await fetch(`${q}/api/admin/reviews/${s}/toggle-flag`,{method:"PUT",headers:{Authorization:`Bearer ${f.token}`,"Content-Type":"application/json"}}),o=await a.json();if(!a.ok)throw new Error(o.message||`Failed to ${i} review.`);r&&(r.textContent=o.message||`Review ${i}ged successfully.`,r.className="form-feedback success");const n=e.closest(".admin-review-item");if(n){const c=o.review.isFlagged;e.textContent=c?"Unflag Review":"Flag Review",e.dataset.currentFlagStatus=c.toString(),e.classList.toggle("warning",!c),e.classList.toggle("secondary",c);const l=n.querySelector(".admin-review-flag-status");l&&(l.innerHTML=c?"🚩 Flagged":"🟢 Clear",l.dataset.flagged=c.toString())}setTimeout(()=>{r&&(r.style.display="none")},3e3)}catch(a){console.error(`Error ${i}ging review by admin:`,a),r&&(r.textContent=a.message||"An error occurred.",r.className="form-feedback error")}}}function St(e,s,t,i,r,a){le();const o=document.createElement("div");o.id="video-player-modal-overlay";const n=document.createElement("div");n.id="video-player-modal-content";const c=document.createElement("h4");c.id="video-player-title",c.textContent=s||"Watch Video";const l=document.createElement("video");l.controls=!0,l.src=e,l.style.width="100%",l.style.maxHeight="80vh",l.setAttribute("aria-label",s||"Lesson Video"),l.setAttribute("playsinline",""),l.setAttribute("webkit-playsinline","");const d=document.createElement("button");d.id="video-player-modal-close-btn",d.innerHTML="&times;",d.setAttribute("aria-label","Close video player"),d.onclick=le,n.appendChild(d),n.appendChild(c),n.appendChild(l),o.appendChild(n),document.body.appendChild(o),document.body.classList.add("no-scroll"),K=o,N=l,a&&a.isAuthenticated&&a.user?(P=`skillsharehub_video_progress_${a.user.userId}_${t}_s${i}_l${r}`,l.onloadedmetadata=()=>{const h=localStorage.getItem(P);h&&(l.currentTime=parseFloat(h)),l.play().catch(y=>console.warn("Autoplay prevented:",y.message))},l.onpause=()=>{P&&localStorage.setItem(P,l.currentTime.toString())},V&&clearInterval(V),V=setInterval(()=>{N&&!N.paused&&P&&localStorage.setItem(P,N.currentTime.toString())},5e3)):l.play().catch(p=>console.warn("Autoplay prevented:",p.message)),document.addEventListener("keydown",Ae)}function le(){N&&P&&f.isAuthenticated&&localStorage.setItem(P,N.currentTime.toString()),V&&(clearInterval(V),V=null),N&&(N.pause(),N.src="",N=null),K&&(K.remove(),K=null),document.body.classList.remove("no-scroll"),P=null,document.removeEventListener("keydown",Ae)}function Ae(e){e.key==="Escape"&&le()}function Ct(e){const s=e.dataset.videoUrl,t=e.dataset.lessonTitle,i=e.dataset.courseId,r=e.dataset.sectionIndex,a=e.dataset.lessonIndex;s?St(s,t,i,r,a,f):console.error("Video URL not found on button.")}async function Tt(e){const s=e.dataset.courseId,t=e.dataset.reviewId,r=e.dataset.currentFlagStatus==="true"?"unflag":"flag",a=`review-flag-feedback-${s}`,o=document.getElementById(a);if(!s||!t){o&&(o.textContent="Error: Course or Review ID missing.",o.className="form-feedback error",o.style.display="block");return}if(window.confirm(`Are you sure you want to ${r} this review?`)){o&&(o.textContent=`${r==="flag"?"Flagging":"Unflagging"} review...`,o.className="form-feedback processing",o.style.display="block");try{const n=await fetch(`${q}/api/courses/${s}/reviews/${t}/toggle-flag`,{method:"PUT",headers:{Authorization:`Bearer ${f.token}`,"Content-Type":"application/json"}}),c=await n.json();if(!n.ok)throw new Error(c.message||`Failed to ${r} review.`);o&&(o.textContent=c.message||`Review ${r}ged successfully.`,o.className="form-feedback success");const l=e.closest("li");if(l){const d=c.review.isFlagged;e.textContent=d?"Unflag Review":"Flag Review",e.dataset.currentFlagStatus=d.toString(),e.classList.toggle("warning",!d),e.classList.toggle("secondary",d);let p=l.querySelector(".review-flag-indicator");if(!p){p=document.createElement("span"),p.className="review-flag-indicator";const h=l.querySelector("strong");h&&h.insertAdjacentElement("afterend",p)}p.innerHTML=d?"🚩 Flagged":"",p.dataset.flagged=d.toString(),p.style.display=d?"inline":"none"}setTimeout(()=>{o&&(o.style.display="none")},3e3)}catch(n){console.error(`Error ${r}ging review (CourseView):`,n),o&&(o.textContent=n.message||"An error occurred.",o.className="form-feedback error")}}}function qt(){const e=document.getElementById("main-content");if(!e||e._listenersAttached)return;e.addEventListener("submit",async t=>{if((t.target.matches("#login-form")||t.target.matches("#signup-form")||t.target.matches("#create-course-form")||t.target.matches("#edit-course-form")||t.target.matches("#submit-review-form")||t.target.matches("#search-form")||t.target.classList.contains("quiz-form")||t.target.id==="payment-form")&&t.preventDefault(),t.target.matches("#login-form"))pe(t.target,"login");else if(t.target.matches("#signup-form"))pe(t.target,"signup");else if(t.target.matches("#create-course-form"))ye(t.target);else if(t.target.matches("#edit-course-form")){const i=t.target.dataset.courseId;if(i)Te(t.target,i);else{const r=t.target.querySelector("#edit-course-feedback");r&&(r.textContent="Error: Course ID missing.",r.className="form-feedback error",r.style.display="block")}}else if(t.target.matches("#submit-review-form"))Nt(t.target);else if(t.target.matches("#search-form"))Lt(t.target);else if(t.target.classList.contains("quiz-form"))Pt(t.target,f);else if(t.target.matches("#payment-form")){const i=t.target.dataset.courseId,r=t.target.dataset.courseName,a=parseFloat(t.target.dataset.expectedPrice),o=t.target.dataset.enrollmentId;if(i&&r&&!isNaN(a)&&o)Ft(t.target,i,r,a,o,f);else{console.error("Missing courseId, courseName, expectedPrice, or enrollmentId on payment form");const n=t.target.querySelector("#payment-feedback");n&&(n.textContent="Error: Form data missing. Please try again.",n.className="form-feedback error",n.style.display="block")}}}),e.addEventListener("click",t=>{var d;const i=t.target,r=i.closest("#create-course-form"),a=i.closest("#edit-course-form"),o=i.closest("#admin-panel"),n=i.closest("#instructor-analytics"),c=i.closest(".course-view-section");let l=null;if(r?l=Ke:a&&(l=rt),l&&(i.matches("#add-section-btn")||i.classList.contains("add-section-btn")?l.addSection():i.classList.contains("remove-section-btn")?l.removeElement(i,".section-item"):i.classList.contains("add-lesson-btn")?l.addLesson(i):i.classList.contains("remove-lesson-btn")?l.removeElement(i,".lesson-item"):i.classList.contains("add-resource-btn")?l.addResource(i):i.classList.contains("remove-resource-btn")?l.removeElement(i,".resource-item"):i.classList.contains("add-quiz-question-btn")?l.addQuizQuestion(i):i.classList.contains("remove-quiz-question-btn")&&l.removeElement(i,".quiz-question-item")),o&&(i.classList.contains("admin-delete-user-btn")?gt(i):i.classList.contains("admin-block-user-btn")?vt(i):i.classList.contains("admin-delete-course-btn")?ht(i):i.classList.contains("admin-delete-review-btn")?yt(i):i.classList.contains("admin-edit-review-btn")?bt(i):i.classList.contains("admin-save-review-btn")?wt(i):i.classList.contains("admin-cancel-edit-review-btn")?Le(i):i.classList.contains("admin-toggle-flag-review-btn")&&kt(i)),n&&i.classList.contains("instructor-flag-review-btn")&&$t(i),c&&(i.classList.contains("flag-review-btn")&&Tt(i),i.classList.contains("watch-video-btn")&&Ct(i)),i.matches(".enroll-now-btn")){const p=i.dataset.courseId,h=parseFloat(i.dataset.coursePrice);if(p&&!isNaN(h))At(p,h,f);else{console.error("Course ID or Price not found for enrollment from button data attributes");const y=(d=i.closest(".course-meta-cv"))==null?void 0:d.querySelector(`#cv-enroll-feedback-${p}`);y&&(y.textContent="Error initiating enrollment. Please try again.",y.className="form-feedback error",y.style.display="block")}}else if(i&&(i.matches(".course-card button.view-details-btn")||i.closest(".course-card button.view-details-btn"))){const p=i.closest(".course-card"),h=p==null?void 0:p.dataset.courseId;h&&(window.location.hash=`#course-view/${h}`)}}),e.addEventListener("change",t=>{if(t.target.classList.contains("progress-item-checkbox")){const i=t.target.dataset.itemId,r=t.target.dataset.enrollmentId,a=t.target.dataset.courseId,o=t.target.checked;i&&r&&a&&Rt(i,o,r,a,f)}}),e._listenersAttached=!0;const s=document.querySelector("header");s&&s.addEventListener("click",t=>{})}async function Lt(e){const s=new FormData(e),t=new URLSearchParams;for(const[r,a]of s.entries())a&&t.set(r,a);history.pushState(null,"",`?${t.toString()}#courses`),j()}async function At(e,s,t){if(!t.isAuthenticated){window.location.hash="#login";return}const i=document.getElementById(`course-view-${e}`);let r=i?i.querySelector(`#cv-enroll-feedback-${e}`):null;!r&&document.getElementById("main-content"),r&&(r.textContent="Processing enrollment...",r.className="form-feedback processing",r.style.display="block");try{const a=await fetch(`${q}/api/enrollments`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t.token}`},body:JSON.stringify({courseId:e})}),o=await a.json();if(!a.ok&&a.status!==200)throw new Error(o.message||"Enrollment failed");const n=o.enrollment;if(s>0&&n&&n.status==="pending_payment")window.location.hash=`#payment/${e}?enrollmentId=${n.id}`,r&&(r.textContent="Redirecting to payment...",r.className="form-feedback info");else if(s===0&&n&&n.status==="enrolled")r&&(r.textContent=o.message||"Successfully enrolled!",r.className="form-feedback success"),setTimeout(()=>{window.location.hash=`#course-view/${e}`},100);else if(n&&n.status==="enrolled")r&&(r.textContent=o.message||"Already enrolled!",r.className="form-feedback info"),setTimeout(()=>{window.location.hash=`#course-view/${e}`},100);else throw new Error(o.message||"Enrollment status unclear.")}catch(a){console.error("Enrollment error:",a),r&&(r.textContent=a.message||"Enrollment failed.",r.className="form-feedback error")}}async function Ft(e,s,t,i,r,a){const o=e.querySelector("#payment-feedback");if(o&&(o.textContent="Processing payment and confirming enrollment...",o.className="form-feedback processing",o.style.display="block"),!r){o&&(o.textContent="Error: Enrollment ID missing. Please try enrolling again.",o.className="form-feedback error");return}try{const n=await fetch(`${q}/api/enrollments/${r}/confirm-payment`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${a.token}`}}),c=await n.json();if(!n.ok)throw new Error(c.message||"Payment confirmation or enrollment update failed.");const l=document.getElementById("payment-form-area");if(l){const d=new Date,h=`
                <div class="payment-receipt-container">
                    <header class="receipt-header">
                        <h2>Payment Successful!</h2>
                        <p>Your mock payment receipt</p>
                    </header>
                    <div class="receipt-details">
                        <p><strong>Transaction ID:</strong> ${`SSH-MOCK-${d.getTime()}-${Math.random().toString(36).substring(2,8).toUpperCase()}`}</p>
                        <p><strong>Date & Time:</strong> ${d.toLocaleString()}</p>
                        <p><strong>Billed To:</strong> ${a.user.email}</p>
                        <p><strong>Payment Method:</strong> Mock Secure Checkout</p>
                        <p><strong>Seller:</strong> SkillShareHub</p>
                    </div>
                    <div class="receipt-items">
                        <h4>Item Details</h4>
                        <div class="receipt-item">
                            <span>${t}</span>
                            <span>$${i.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="receipt-total">
                        <p><strong>Total Paid:</strong> $${i.toFixed(2)}</p>
                        <p><strong>Status:</strong> Completed</p>
                    </div>
                    <div class="receipt-actions">
                        <a href="#course-view/${s}" class="button-like primary">Continue to Course</a>
                    </div>
                </div>`;l.innerHTML=h}else o&&(o.textContent=c.message||"Payment successful, enrolled! (Receipt area not found)",o.className="form-feedback success")}catch(n){console.error("Payment/Confirmation error:",n),o&&(o.textContent=n.message||"Payment confirmation or enrollment failed.",o.className="form-feedback error")}}async function Nt(e){const s=e.dataset.courseId,t=e.elements.rating.value,i=e.elements.reviewText.value,r=f.token,a=e.querySelector(".form-feedback");if(!t||!i){a&&(a.textContent="Rating and review text are required.",a.className="form-feedback error",a.style.display="block");return}a&&(a.textContent="Submitting...",a.className="form-feedback processing",a.style.display="block");try{const o=await fetch(`${q}/api/courses/${s}/reviews`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`},body:JSON.stringify({rating:t,reviewText:i})}),n=await o.json();if(!o.ok)throw new Error(n.message||"Failed to submit review");a&&(a.textContent="Review submitted successfully!",a.className="form-feedback success"),e.reset(),document.getElementById("main-content")&&window.location.hash.split("?")[0]===`#course-view/${s}`&&j()}catch(o){a&&(a.textContent=o.message,a.className="form-feedback error"),console.error("Review submission error:",o)}}async function Rt(e,s,t,i,r){const a=document.getElementById(`course-view-${i}`);let o=null;a&&(o=a.querySelector(`#cv-enroll-feedback-${i}`)),o&&(o.textContent="Updating progress...",o.className="form-feedback processing",o.style.display="block");try{const n=await fetch(`${q}/api/enrollments/${t}/progress`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r.token}`},body:JSON.stringify({itemId:e,completed:s})}),c=await n.json();if(!n.ok)throw new Error(c.message||"Failed to update progress.");o&&(o.textContent="Progress updated!",o.className="form-feedback success"),setTimeout(()=>{o&&(o.style.display="none"),window.location.hash.split("?")[0]===`#course-view/${i}`&&j()},1e3)}catch(n){console.error("Progress update error:",n),o&&(o.textContent=n.message||"Failed to update progress.",o.className="form-feedback error")}}async function Pt(e,s){const t=e.dataset.courseId,i=e.dataset.sectionIndex,r=e.dataset.lessonIndex,a=e.dataset.enrollmentId,o=e.querySelector(".quiz-feedback");o&&(o.textContent="Submitting quiz...",o.className="quiz-feedback processing",o.style.display="block");const n={};e.querySelectorAll('input[type="radio"]:checked').forEach(c=>{n[c.name]=c.value});try{const c=await fetch(`${q}/api/quizzes/submit`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.token}`},body:JSON.stringify({courseId:t,sectionIndex:i,lessonIndex:r,enrollmentId:a,answers:n})}),l=await c.json();if(!c.ok)throw new Error(l.message||"Failed to submit quiz.");o&&(o.textContent=l.message||`Quiz Submitted! Score: ${l.score}%`,o.className=l.passed?"quiz-feedback success":"quiz-feedback error"),window.location.hash.split("?")[0]===`#course-view/${t}`&&j()}catch(c){console.error("Quiz submission error:",c),o&&(o.textContent=c.message||"Failed to submit quiz.",o.className="quiz-feedback error")}}document.addEventListener("authChange",e=>{qe(e.detail)});window.addEventListener("hashchange",()=>{const e=document.querySelector("header");if(e&&B.contains(e))e.outerHTML=X(f);else if(B){ee();return}j()});document.addEventListener("DOMContentLoaded",()=>{mt(),ft()||ee()});
