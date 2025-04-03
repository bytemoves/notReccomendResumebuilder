function collectFormData() {
  const formData = {
    full_name: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    summary: document.getElementById("summary").value,
    education: [],
    experience: [],
    skills: [],
  };

  document.querySelectorAll(".education-entry").forEach((entry) => {
    const inputs = entry.querySelectorAll("input");
    formData.education.push({
      institution: inputs[0].value,
      degree: inputs[1].value,
      field: inputs[2].value,
      gpa: inputs[3].value || null,
      start_date: inputs[4].value,
      end_date: inputs[5].value,
    });
  });

  document.querySelectorAll(".experience-entry").forEach((entry) => {
    const inputs = entry.querySelectorAll("input, textarea");
    formData.experience.push({
      company: inputs[0].value,
      position: inputs[1].value,
      start_date: inputs[2].value,
      end_date: inputs[3].value,
      description: inputs[4].value,
    });
  });

  document.querySelectorAll("#skillsContainer .row").forEach((entry) => {
    const inputs = entry.querySelectorAll("input, select");
    formData.skills.push({
      name: inputs[0].value,
      level: inputs[1].value,
    });
  });

  return formData;
}

function updatePreview() {
  const formData = collectFormData();
  const preview = document.getElementById("resumePreview");

  let previewHTML = `
        <div class="preview-content">
            <h2 class="mb-3">${formData.full_name}</h2>
            <div class="mb-3">
                <p><i class="fas fa-envelope"></i> ${formData.email}</p>
                <p><i class="fas fa-phone"></i> ${formData.phone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${formData.address}</p>
            </div>
            
            <h4 class="mt-4">Professional Summary</h4>
            <p>${formData.summary}</p>
            
            <h4 class="mt-4">Education</h4>
            ${formData.education
              .map(
                (edu) => `
                <div class="mb-3">
                    <h5>${edu.institution}</h5>
                    <p>${edu.degree} in ${edu.field}</p>
                    <p>${edu.start_date} - ${edu.end_date}</p>
                    ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ""}
                </div>
            `
              )
              .join("")}
            
            <h4 class="mt-4">Work Experience</h4>
            ${formData.experience
              .map(
                (exp) => `
                <div class="mb-3">
                    <h5>${exp.position} at ${exp.company}</h5>
                    <p>${exp.start_date} - ${exp.end_date}</p>
                    <p>${exp.description}</p>
                </div>
            `
              )
              .join("")}
            
            <h4 class="mt-4">Skills</h4>
            <div class="skills-container">
                ${formData.skills
                  .map(
                    (skill) => `
                    <span class="skill-badge">${skill.name} (${skill.level})</span>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  preview.innerHTML = previewHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resumeForm");
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  // Form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = collectFormData();

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Resume saved successfully!");
      } else {
        throw new Error("Failed to save resume");
      }
    } catch (error) {
      alert("Error saving resume: " + error.message);
    }
  });

  // Add suggestion buttons to each section
  const sections = [
    "Personal Information",
    "Professional Summary",
    "Education",
    "Work Experience",
    "Skills",
  ];
  sections.forEach((section) => {
    const sectionElement = document.querySelector(
      `.resume-section:has(h3:contains('${section}'))`
    );
    if (sectionElement) {
      const suggestionButton = document.createElement("button");
      suggestionButton.className = "btn btn-outline-info btn-sm float-end";
      suggestionButton.innerHTML =
        '<i class="fas fa-robot"></i> Get AI Suggestions';
      suggestionButton.onclick = async () => {
        let content = "";
        switch (section) {
          case "Personal Information":
            content = `Name: ${document.getElementById("fullName").value}
Email: ${document.getElementById("email").value}
Phone: ${document.getElementById("phone").value}
Address: ${document.getElementById("address").value}`;
            break;
          case "Professional Summary":
            content = document.getElementById("summary").value;
            break;
          case "Education":
            const educationEntries =
              document.querySelectorAll(".education-entry");
            content = Array.from(educationEntries)
              .map((entry) => {
                const inputs = entry.querySelectorAll("input");
                return `Institution: ${inputs[0].value}
Degree: ${inputs[1].value}
Field: ${inputs[2].value}
GPA: ${inputs[3].value}
Period: ${inputs[4].value} - ${inputs[5].value}`;
              })
              .join("\n\n");
            break;
          case "Work Experience":
            const experienceEntries =
              document.querySelectorAll(".experience-entry");
            content = Array.from(experienceEntries)
              .map((entry) => {
                const inputs = entry.querySelectorAll("input, textarea");
                return `Company: ${inputs[0].value}
Position: ${inputs[1].value}
Period: ${inputs[2].value} - ${inputs[3].value}
Description: ${inputs[4].value}`;
              })
              .join("\n\n");
            break;
          case "Skills":
            const skillEntries = document.querySelectorAll(
              "#skillsContainer .row"
            );
            content = Array.from(skillEntries)
              .map((entry) => {
                const inputs = entry.querySelectorAll("input, select");
                return `${inputs[0].value} (${inputs[1].value})`;
              })
              .join("\n");
            break;
        }

        const suggestions = await getSuggestions(section, content);
        if (suggestions) {
          showSuggestions(
            section,
            suggestions.suggestions,
            suggestions.improved_content
          );
        }
      };
      sectionElement.querySelector("h3").appendChild(suggestionButton);
    }
  });
});

// Function to get AI suggestions
async function getSuggestions(section, content) {
  try {
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        section: section,
        content: content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get suggestions");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return null;
  }
}

// Function to show suggestions
function showSuggestions(section, suggestions, improvedContent) {
  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.className = "suggestions-container mt-3";

  let suggestionsHTML = `
      <div class="card">
          <div class="card-header">
              <h5 class="mb-0">AI Suggestions for ${section}</h5>
          </div>
          <div class="card-body">
              <h6>Suggestions:</h6>
              <ul class="list-unstyled">
                  ${suggestions
                    .map(
                      (suggestion) => `
                      <li><i class="fas fa-lightbulb text-warning"></i> ${suggestion}</li>
                  `
                    )
                    .join("")}
              </ul>
  `;

  if (improvedContent) {
    suggestionsHTML += `
          <h6 class="mt-3">Improved Version:</h6>
          <div class="improved-content p-3 bg-light rounded">
              ${improvedContent}
          </div>
          <button class="btn btn-sm btn-primary mt-2" onclick="applyImprovedContent('${section}')">
              <i class="fas fa-check"></i> Apply Improved Version
          </button>
    `;
  }

  suggestionsHTML += `
      </div>
  </div>
  `;

  suggestionsContainer.innerHTML = suggestionsHTML;

  // Remove existing suggestions if any
  const existingSuggestions = document.querySelector(".suggestions-container");
  if (existingSuggestions) {
    existingSuggestions.remove();
  }

  // Add new suggestions after the section
  const sectionElement = document.querySelector(
    `.resume-section:has(h3:contains('${section}'))`
  );
  if (sectionElement) {
    sectionElement.appendChild(suggestionsContainer);
  }
}

// Function to apply improved content
function applyImprovedContent(section) {
  const improvedContent =
    document.querySelector(".improved-content").textContent;
  let targetElement;

  switch (section) {
    case "Professional Summary":
      targetElement = document.getElementById("summary");
      break;
    case "Education":
      targetElement = document.querySelector(
        ".education-entry:last-child textarea"
      );
      break;
    case "Work Experience":
      targetElement = document.querySelector(
        ".experience-entry:last-child textarea"
      );
      break;
  }

  if (targetElement) {
    targetElement.value = improvedContent;
    updatePreview();
  }
}
