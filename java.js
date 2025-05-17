const baseURL = "https://gcs-coding.com/jsonapi/node/slider";
  const sliderContainer = document.getElementById("slider-content");

  fetch(`${baseURL}`)
    .then(res => res.json())
    .then(data => {
      const slides = data.data;

      if (slides.length === 0) {
        sliderContainer.innerHTML = '<div class="text-center p-5">لا توجد بيانات</div>';
        return;
      }

      const promises = slides.map((slide, index) => {
        const title = slide.attributes.title;
        const body = slide.attributes.body?.processed || '';
        const imageId = slide.relationships?.field_image?.data?.id;

        if (imageId) {
          return fetch(`${baseURL}/jsonapi/file/file/${imageId}`)
            .then(res => res.json())
            .then(imgData => {
              const imageUrl = baseURL + imgData.data.attributes.uri.url;
              return { title, body, imageUrl };
            });
        } else {
          return Promise.resolve({ title, body, imageUrl: null });
        }
      });

      Promise.all(promises).then(results => {
        results.forEach((slideData, index) => {
          const isActive = index === 0 ? "active" : "";
          const imageTag = slideData.imageUrl
            ? `<img src="${slideData.imageUrl}" class="d-block w-100" alt="${slideData.title}">`
            : "";

          const slideHTML = `
            <div class="carousel-item ${isActive}">
              ${imageTag}
              <div class="carousel-caption d-none d-md-block">
                <h5>${slideData.title}</h5>
                <div>${slideData.body}</div>
              </div>
            </div>
          `;

          sliderContainer.innerHTML += slideHTML;
        });
      });
    })
    .catch(error => {
      console.error(error);
      sliderContainer.innerHTML = '<div class="text-danger p-3">فشل في تحميل البيانات</div>';
    });