
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
});
