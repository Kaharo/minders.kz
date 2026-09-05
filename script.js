(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.add("has-js");

  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
      document.body.classList.toggle("nav-open", !isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
        document.body.classList.remove("nav-open");
      });
    });
  }

  const sections = document.querySelectorAll(".section-reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8%" });
    sections.forEach((section) => revealObserver.observe(section));
  }

  const parallaxStage = document.querySelector(".parallax-stage");
  if (parallaxStage && !reduceMotion) {
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const renderPointer = () => {
      frame = 0;
      parallaxStage.style.setProperty("--mx", `${nextX * 8}px`);
      parallaxStage.style.setProperty("--my", `${nextY * 8}px`);
      parallaxStage.style.setProperty("--mx-photo", `${nextX * -8}px`);
      parallaxStage.style.setProperty("--my-photo", `${nextY * -8}px`);
      parallaxStage.style.setProperty("--mx-mark", `${nextX * -12}px`);
      parallaxStage.style.setProperty("--my-mark", `${nextY * -12}px`);
    };

    parallaxStage.addEventListener("pointermove", (event) => {
      const rect = parallaxStage.getBoundingClientRect();
      nextX = (event.clientX - rect.left - rect.width / 2) / rect.width;
      nextY = (event.clientY - rect.top - rect.height / 2) / rect.height;
      if (!frame) frame = requestAnimationFrame(renderPointer);
    });

    parallaxStage.addEventListener("pointerleave", () => {
      nextX = 0;
      nextY = 0;
      if (!frame) frame = requestAnimationFrame(renderPointer);
    });
  }

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const collectionPath = (collection) => `data/${collection}.json`;

  const renderHomeProjects = (items) => items.map((item) => `
    <a class="project-row" href="${escapeHtml(item.href || "projects.html")}">
      <span class="project-mark ${escapeHtml(item.color || "mark-blue")}"></span>
      <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></span>
      <b aria-hidden="true">↗</b>
    </a>
  `).join("");

  const renderHomeNews = (items) => items.map((item) => `
    <a class="latest-row" href="${escapeHtml(item.href || "news.html")}">
      <small>${escapeHtml(item.kind)}</small>
      <strong>${escapeHtml(item.title)}</strong>
      <time datetime="${escapeHtml(item.isoDate)}">${escapeHtml(item.shortDate)}</time>
      <span aria-hidden="true">↗</span>
    </a>
  `).join("");

  const renderHomeLearning = (items) => items.map((item) => `
    <a href="learning.html" class="learning-tag ${escapeHtml(item.color || "tag-blue")}">${escapeHtml(item.title)}</a>
  `).join("");

  const renderPageRows = (items, collection) => items.map((item) => `
    <a class="page-list-row" href="${escapeHtml(item.href || `${collection}.html`)}">
      <small>${escapeHtml(item.kind || item.meta || "сообщество")}</small>
      <span><strong>${escapeHtml(item.title)}</strong><em>${escapeHtml(item.description || item.meta || "")}</em></span>
      <time datetime="${escapeHtml(item.isoDate || "2026-09-20")}">${escapeHtml(item.shortDate || item.date || "")}</time>
      <b aria-hidden="true">↗</b>
    </a>
  `).join("");

  const eventTypeLabels = {
    brunch: "brunch",
    "light-steps": "light steps",
    focused: "focused"
  };

  const eventTypeOrder = ["brunch", "light-steps", "focused"];

  const eventTypeDescriptions = {
    brunch: "Большой разговор за кофе.",
    "light-steps": "Прогулка, воздух и идеи в движении.",
    focused: "Одна тема, глубже обычного."
  };

  const eventStatusLabels = {
    past: "прошло",
    cancelled: "отменено"
  };

  const eventDate = (item) => new Date(`${item.date || ""}T12:00:00`);

  const eventTimestamp = (item) => {
    const timestamp = eventDate(item).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };

  const eventDateParts = (item) => {
    const date = eventDate(item);
    if (Number.isNaN(date.getTime())) {
      const fallback = String(item.date || "").split("-");
      return { day: fallback[2] || "", month: fallback[1] || "" };
    }
    return {
      day: new Intl.DateTimeFormat("ru-RU", { day: "2-digit" }).format(date),
      month: new Intl.DateTimeFormat("ru-RU", { month: "short" }).format(date).replace(".", "")
    };
  };

  const eventTypeLabel = (item) => eventTypeLabels[item.type] || item.type || "встреча";

  const eventMeta = (item) => [item.time, item.location].filter(Boolean).join(" / ");

  const eventCountLabel = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    const noun = lastDigit === 1 && lastTwoDigits !== 11
      ? "событие"
      : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
        ? "события"
        : "событий";
    return `${count} ${noun}`;
  };

  const eventMedia = (item) => {
    const imagePath = typeof item.image === "string" ? item.image.trim() : "";
    const fallbackLabel = item.status === "cancelled" ? "отменено" : eventTypeLabel(item);
    const image = imagePath
      ? `<img src="${escapeHtml(imagePath)}" alt="${escapeHtml(item.title || "Фото события")}" loading="lazy" onerror="this.parentElement.classList.add('is-fallback');this.remove()">`
      : "";
    return `<span class="calendar-event-media${image ? "" : " is-fallback"}"><span class="calendar-media-fallback" aria-hidden="true"><small>${escapeHtml(fallbackLabel)}</small><strong>#${escapeHtml(item.number || "")}</strong></span>${image}</span>`;
  };

  const renderCalendarEvent = (item, nextId) => {
    const dateParts = eventDateParts(item);
    const href = item.href || `events.html#${item.id || "calendar"}`;
    const status = eventStatusLabels[item.status] || item.status || "";
    const meta = eventMeta(item);
    const description = item.description ? `<span class="calendar-event-description">${escapeHtml(item.description)}</span>` : "";
    return `
      <a id="${escapeHtml(item.id || `event-${item.number || ""}`)}" class="calendar-event${item.id === nextId ? " is-next" : ""}${item.status === "cancelled" ? " is-cancelled" : ""}" href="${escapeHtml(href)}">
        <time class="calendar-date" datetime="${escapeHtml(item.date || "")}"><strong>${escapeHtml(dateParts.day)}</strong><span>${escapeHtml(dateParts.month)}</span></time>
        <span class="calendar-event-copy"><span class="calendar-event-kicker"><small>${escapeHtml(eventTypeLabel(item))}</small><em>${escapeHtml(status)}</em><b>#${escapeHtml(item.number || "")}</b></span><strong>${escapeHtml(item.title || "Без названия")}</strong>${meta ? `<em class="calendar-event-meta">${escapeHtml(meta)}</em>` : ""}${description}</span>
        ${eventMedia(item)}
        <b class="calendar-event-arrow" aria-hidden="true">↗</b>
      </a>
    `;
  };

  const sortEventsByDate = (items) => [...items].sort((a, b) => {
    const dateDifference = eventTimestamp(b) - eventTimestamp(a);
    return dateDifference || Number(b.number || 0) - Number(a.number || 0);
  });

  const renderCalendar = (items) => {
    const now = Date.now();
    const orderedItems = sortEventsByDate(items);
    const nextEvent = orderedItems.find((item) => item.status !== "cancelled" && eventTimestamp(item) >= now);
    const nextId = nextEvent ? nextEvent.id : "";
    const groups = orderedItems.reduce((grouped, item) => {
      const type = item.type || "other";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
      return grouped;
    }, {});
    const groupOrder = [...eventTypeOrder, ...Object.keys(groups).filter((type) => !eventTypeOrder.includes(type))];

    return groupOrder.filter((type) => groups[type]).map((type) => `
      <section class="calendar-group" data-event-group="${escapeHtml(type)}" aria-labelledby="event-group-${escapeHtml(type)}">
        <header class="calendar-group-header"><h3 id="event-group-${escapeHtml(type)}"><span class="event-type-dot" aria-hidden="true"></span>${escapeHtml(eventTypeLabels[type] || type)}</h3><span>${eventCountLabel(groups[type].length)}</span></header>
        <div class="calendar-group-list">${groups[type].map((item) => renderCalendarEvent(item, nextId)).join("")}</div>
      </section>
    `).join("");
  };

  const renderEventColumnItem = (item) => {
    const dateParts = eventDateParts(item);
    const href = item.href || `events.html#${item.id || "calendar"}`;
    const status = eventStatusLabels[item.status] || item.status || "";
    const meta = eventMeta(item);
    const supportingText = meta || item.description || "";
    return `
      <a class="event-column-item${item.status === "cancelled" ? " is-cancelled" : ""}" href="${escapeHtml(href)}">
        <time class="event-column-date" datetime="${escapeHtml(item.date || "")}"><strong>${escapeHtml(dateParts.day)}</strong><span>${escapeHtml(dateParts.month)}</span></time>
        <span class="event-column-copy"><span class="event-column-kicker"><small>${escapeHtml(status || "встреча")}</small><b>#${escapeHtml(item.number || "")}</b></span><strong>${escapeHtml(item.title || "Без названия")}</strong>${supportingText ? `<em>${escapeHtml(supportingText)}</em>` : ""}</span>
        <b class="event-column-arrow" aria-hidden="true">↗</b>
      </a>
    `;
  };

  const renderEventTypeColumns = (items) => {
    const groups = items.reduce((grouped, item) => {
      const type = item.type || "other";
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(item);
      return grouped;
    }, {});
    const groupOrder = [...eventTypeOrder, ...Object.keys(groups).filter((type) => !eventTypeOrder.includes(type))];
    const orderedItems = sortEventsByDate(items);

    return `<div class="event-type-columns">${groupOrder.filter((type) => groups[type]).map((type) => {
      const groupItems = orderedItems.filter((item) => (item.type || "other") === type);
      return `
        <section class="event-type-column" data-event-type="${escapeHtml(type)}" aria-labelledby="event-column-${escapeHtml(type)}">
          <header class="event-type-column-header"><div><span class="event-type-dot" aria-hidden="true"></span><h3 id="event-column-${escapeHtml(type)}">${escapeHtml(eventTypeLabels[type] || type)}</h3></div><span>${eventCountLabel(groupItems.length)}</span><p>${escapeHtml(eventTypeDescriptions[type] || "Формат встречи сообщества.")}</p></header>
          <div class="event-type-column-list">${groupItems.map(renderEventColumnItem).join("")}</div>
        </section>
      `;
    }).join("")}</div>`;
  };

  const monthKey = (item) => String(item.date || "").slice(0, 7);

  const monthLabel = (key) => {
    const date = new Date(`${key}-01T12:00:00`);
    if (Number.isNaN(date.getTime())) return key;
    return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
  };

  const renderMonthDayEvent = (item) => {
    const href = item.href || `events.html#${item.id || "calendar"}`;
    return `<a class="month-day-event${item.status === "cancelled" ? " is-cancelled" : ""}" data-type="${escapeHtml(item.type || "other")}" href="${escapeHtml(href)}" title="${escapeHtml(item.title || "Событие")}"><span>#${escapeHtml(item.number || "")}</span><strong>${escapeHtml(item.title || "Без названия")}</strong></a>`;
  };

  const renderMonthlyCalendar = (items) => {
    const grouped = items.reduce((months, item) => {
      const key = monthKey(item);
      if (!/^\d{4}-\d{2}$/.test(key)) return months;
      if (!months[key]) months[key] = [];
      months[key].push(item);
      return months;
    }, {});
    const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
    const months = Object.keys(grouped).sort();

    return `<div class="month-calendar-list">${months.map((key) => {
      const [year, month] = key.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const leadingDays = (new Date(year, month - 1, 1).getDay() + 6) % 7;
      const totalCells = leadingDays + daysInMonth;
      const trailingDays = (7 - (totalCells % 7)) % 7;
      const eventsByDate = grouped[key].reduce((dates, item) => {
        if (!dates[item.date]) dates[item.date] = [];
        dates[item.date].push(item);
        return dates;
      }, {});
      const cells = [];

      weekdays.forEach((weekday) => {
        cells.push(`<div class="month-weekday" role="columnheader">${weekday}</div>`);
      });
      for (let index = 0; index < leadingDays; index += 1) {
        cells.push(`<div class="month-day is-empty" role="gridcell" aria-hidden="true"></div>`);
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateKey = `${key}-${String(day).padStart(2, "0")}`;
        const dayEvents = (eventsByDate[dateKey] || []).sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
        cells.push(`<div class="month-day${dayEvents.length ? " has-events" : ""}" role="gridcell"><time datetime="${dateKey}">${day}</time>${dayEvents.map(renderMonthDayEvent).join("")}</div>`);
      }
      for (let index = 0; index < trailingDays; index += 1) {
        cells.push(`<div class="month-day is-empty" role="gridcell" aria-hidden="true"></div>`);
      }

      return `<section class="month-calendar-month" aria-labelledby="month-${escapeHtml(key)}"><header class="month-calendar-month-header"><h3 id="month-${escapeHtml(key)}">${escapeHtml(monthLabel(key))}</h3><span>${eventCountLabel(grouped[key].length)}</span></header><div class="month-calendar-grid" role="grid" aria-label="${escapeHtml(monthLabel(key))}">${cells.join("")}</div></section>`;
    }).join("")}</div>`;
  };

  const renderFeaturedEvent = (items) => {
    const orderedItems = sortEventsByDate(items);
    const now = Date.now();
    const upcoming = orderedItems.find((item) => item.status !== "cancelled" && eventTimestamp(item) >= now);
    const featured = upcoming || orderedItems.find((item) => item.status !== "cancelled") || orderedItems[0];
    if (!featured) return `<p class="collection-error">Пока нет событий.</p>`;

    const isUpcoming = featured === upcoming;
    const meta = eventMeta(featured);
    const details = [new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" }).format(eventDate(featured)), meta].filter(Boolean).join(", ");
    const action = isUpcoming
      ? `<a class="button button-dark" href="https://t.me/+SoZBXVPxmp1mYjRi" target="_blank" rel="noreferrer">я иду <span aria-hidden="true">→</span></a>`
      : `<a class="button button-dark" href="#calendar">смотреть календарь <span aria-hidden="true">→</span></a>`;
    return `<p class="section-kicker">${isUpcoming ? "ближайший ивент" : "последняя встреча"}</p><h2>${escapeHtml(featured.title || "Событие")}</h2><p>${escapeHtml(details)}</p>${action}`;
  };

  const renderPagePeople = (items) => items.map((item) => `
    <div class="page-list-row">
      <small>${escapeHtml(item.role)}</small>
      <span><strong>${escapeHtml(item.name)}</strong><em>${escapeHtml(item.note || "minders astana")}</em></span>
      <span class="project-mark ${escapeHtml(item.color || "mark-blue")}" aria-hidden="true"></span>
      <b aria-hidden="true">+</b>
    </div>
  `).join("");

  const renderPageLearning = (items) => `
    <div class="tag-wall">${items.map((item) => `<a href="learning.html" class="learning-tag ${escapeHtml(item.color || "tag-blue")}">${escapeHtml(item.title)}</a>`).join("")}</div>
  `;

  const renderPageProjects = (items) => items.map((item) => `
    <a class="page-list-row" id="${escapeHtml(item.slug || "project")}" href="${escapeHtml(item.href || "projects.html")}">
      <small>${escapeHtml(item.meta)}</small>
      <span><strong>${escapeHtml(item.title)}</strong><em>${escapeHtml(item.description || "Проект сообщества")}</em></span>
      <span class="project-mark ${escapeHtml(item.color || "mark-blue")}" aria-hidden="true"></span>
      <b aria-hidden="true">↗</b>
    </a>
  `).join("");

  const hydrateCollections = async () => {
    const targets = [...document.querySelectorAll("[data-collection]")];
    await Promise.all(targets.map(async (target) => {
      const collection = target.dataset.collection;
      try {
        const response = await fetch(collectionPath(collection), { cache: "no-store" });
        if (!response.ok) throw new Error(`Could not load ${collection}`);
        const items = await response.json();
        const limit = Number(target.dataset.limit || items.length);
        const visibleItems = items.slice(0, limit);
        const isPage = target.dataset.view === "page";
        if (collection === "projects") {
          target.innerHTML = isPage ? renderPageProjects(visibleItems) : renderHomeProjects(visibleItems);
        } else if (collection === "news") {
          target.innerHTML = isPage ? renderPageRows(visibleItems, collection) : renderHomeNews(visibleItems);
        } else if (collection === "people") {
          target.innerHTML = renderPagePeople(visibleItems);
        } else if (collection === "learning") {
          target.innerHTML = isPage ? renderPageLearning(visibleItems) : renderHomeLearning(visibleItems);
        } else if (collection === "events") {
          target.innerHTML = target.dataset.view === "calendar"
            ? renderCalendar(visibleItems)
            : target.dataset.view === "columns"
              ? renderEventTypeColumns(visibleItems)
              : target.dataset.view === "month-calendar"
                ? renderMonthlyCalendar(visibleItems)
                : target.dataset.view === "featured"
                  ? renderFeaturedEvent(visibleItems)
                  : renderPageRows(visibleItems, collection);
        }
      } catch (error) {
        console.warn(error.message);
        target.innerHTML = `<p class="collection-error">Не удалось загрузить события.</p>`;
      }
    }));
  };

  hydrateCollections();
})();
