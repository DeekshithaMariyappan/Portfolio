document.addEventListener('DOMContentLoaded', () => {
    // Reveal on scroll animation
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    // Initial check
    revealOnScroll();
    
    // Listen for scroll
    window.addEventListener('scroll', revealOnScroll);

    // Smooth scroll for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed nav
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dynamic navbar opacity
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(10, 10, 12, 0.95)';
            nav.style.padding = '1rem 5%';
        } else {
            nav.style.background = 'rgba(10, 10, 12, 0.7)';
            nav.style.padding = '1.5rem 5%';
        }
    });

    // Add some subtle mouse move effect to cards
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Custom Interactive SVG Achievements Chart
    const initChart = () => {
        const container = document.getElementById('svg-chart-container');
        if (!container) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const leetcodeData = [80, 115, 150, 185, 220, 250];
        const hackerrankData = [40, 55, 70, 85, 95, 105];
        const skillrackData = [35, 50, 75, 90, 110, 120];
        
        const totalData = months.map((_, i) => leetcodeData[i] + hackerrankData[i] + skillrackData[i]);

        // Dynamically get dimensions or use defaults, ensuring fallback if too small
        const clientW = container.clientWidth;
        const clientH = container.clientHeight;
        const width = clientW > 100 ? clientW : 500;
        const height = clientH > 100 ? clientH : 280;
        const padding = { top: 30, right: 30, bottom: 45, left: 45 };
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Find max value to scale Y axis
        const maxVal = Math.max(...totalData) * 1.1; // Add 10% headroom

        // Helper to convert data coordinates to SVG pixel space
        const getX = (index) => padding.left + (index / (months.length - 1)) * chartWidth;
        const getY = (value) => padding.top + chartHeight - (value / maxVal) * chartHeight;

        // Build SVG Elements
        let svgHtml = `
            <svg class="svg-chart" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
                <defs>
                    <!-- Gradient definitions for filled area charts -->
                    <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.0"/>
                    </linearGradient>
                    <linearGradient id="grad-leetcode" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ffa116" stop-opacity="0.15"/>
                        <stop offset="100%" stop-color="#ffa116" stop-opacity="0.0"/>
                    </linearGradient>
                    <linearGradient id="grad-hackerrank" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#2ec866" stop-opacity="0.15"/>
                        <stop offset="100%" stop-color="#2ec866" stop-opacity="0.0"/>
                    </linearGradient>
                    <linearGradient id="grad-skillrack" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
        `;

        // Render Y-Axis Grid Lines & Labels (4 grid intervals)
        const gridIntervals = 4;
        for (let i = 0; i <= gridIntervals; i++) {
            const val = Math.round((maxVal / gridIntervals) * i);
            const y = getY(val);
            svgHtml += `
                <line class="grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"/>
                <text class="axis-text" x="${padding.left - 12}" y="${y + 4}" text-anchor="end">${val}</text>
            `;
        }

        // Render X-Axis labels
        months.forEach((m, idx) => {
            const x = getX(idx);
            svgHtml += `
                <text class="axis-text" x="${x}" y="${height - padding.bottom + 25}" text-anchor="middle">${m}</text>
            `;
        });

        // Vertical Tracker line (initially hidden)
        svgHtml += `
            <line id="chart-tracker" class="tracker-line" x1="0" y1="${padding.top}" x2="0" y2="${height - padding.bottom}"/>
        `;

        // Helper to generate paths and points
        const generatePathD = (data) => {
            return data.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');
        };

        const generateAreaPathD = (data) => {
            const startX = getX(0);
            const endX = getX(data.length - 1);
            const bottomY = getY(0);
            return `${generatePathD(data)} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
        };

        // Render Paths & Fills
        // 1. SkillRack (Blue)
        svgHtml += `
            <path class="chart-area skillrack" d="${generateAreaPathD(skillrackData)}"/>
            <path class="chart-line skillrack" d="${generatePathD(skillrackData)}"/>
        `;

        // 2. HackerRank (Green)
        svgHtml += `
            <path class="chart-area hackerrank" d="${generateAreaPathD(hackerrankData)}"/>
            <path class="chart-line hackerrank" d="${generatePathD(hackerrankData)}"/>
        `;

        // 3. LeetCode (Orange)
        svgHtml += `
            <path class="chart-area leetcode" d="${generateAreaPathD(leetcodeData)}"/>
            <path class="chart-line leetcode" d="${generatePathD(leetcodeData)}"/>
        `;

        // 4. Total Progress (Purple)
        svgHtml += `
            <path class="chart-area total" d="${generateAreaPathD(totalData)}"/>
            <path class="chart-line total" d="${generatePathD(totalData)}"/>
        `;

        // Render interactive circles
        months.forEach((_, idx) => {
            svgHtml += `
                <circle class="chart-point total" data-idx="${idx}" cx="${getX(idx)}" cy="${getY(totalData[idx])}"/>
                <circle class="chart-point leetcode" data-idx="${idx}" cx="${getX(idx)}" cy="${getY(leetcodeData[idx])}"/>
                <circle class="chart-point hackerrank" data-idx="${idx}" cx="${getX(idx)}" cy="${getY(hackerrankData[idx])}"/>
                <circle class="chart-point skillrack" data-idx="${idx}" cx="${getX(idx)}" cy="${getY(skillrackData[idx])}"/>
            `;
        });

        svgHtml += `</svg>`;
        container.innerHTML = svgHtml;

        // Chart Interaction & Tooltip Code
        const svg = container.querySelector('svg');
        const tracker = container.querySelector('#chart-tracker');
        const tooltip = document.getElementById('chart-tooltip');
        const points = container.querySelectorAll('.chart-point');

        const showTooltip = (e) => {
            const rect = svg.getBoundingClientRect();
            // Get mouse position relative to SVG coordinates
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            
            // Find closest month index based on X
            let closestIdx = 0;
            let minDist = Infinity;
            months.forEach((_, idx) => {
                const dist = Math.abs(getX(idx) - mouseX);
                if (dist < minDist) {
                    minDist = dist;
                    closestIdx = idx;
                }
            });

            const xPos = getX(closestIdx);
            
            // Set tracker line position
            tracker.setAttribute('x1', xPos);
            tracker.setAttribute('x2', xPos);
            tracker.style.opacity = '1';

            // Highlight corresponding points (increase size)
            points.forEach(point => {
                const idx = parseInt(point.getAttribute('data-idx'));
                if (idx === closestIdx) {
                    point.setAttribute('r', '7');
                    point.setAttribute('stroke-width', '4');
                } else {
                    point.setAttribute('r', '5');
                    point.setAttribute('stroke-width', '3');
                }
            });

            // Populate tooltip content
            tooltip.innerHTML = `
                <div class="tooltip-title">${months[closestIdx]} Progress</div>
                <div class="tooltip-row leetcode">
                    <span class="label">LeetCode</span>
                    <span class="val">${leetcodeData[closestIdx]} Solved</span>
                </div>
                <div class="tooltip-row hackerrank">
                    <span class="label">HackerRank</span>
                    <span class="val">${hackerrankData[closestIdx]} Solved</span>
                </div>
                <div class="tooltip-row skillrack">
                    <span class="label">SkillRack</span>
                    <span class="val">${skillrackData[closestIdx]} Challenges</span>
                </div>
                <div class="tooltip-row total" style="margin-top: 0.4rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.4rem;">
                    <span class="label" style="color: var(--text-main);">Total Progress</span>
                    <span class="val">${totalData[closestIdx]} Solved</span>
                </div>
            `;

            // Position tooltip nicely relative to the chart wrapper
            const wrapperRect = container.parentElement.getBoundingClientRect();
            const relativeX = (xPos / width) * wrapperRect.width;
            
            // Offset tooltip to the left if near the right edge to prevent overflow
            const tooltipOffset = relativeX > wrapperRect.width * 0.65 ? -200 : 20;

            tooltip.style.left = `${relativeX + tooltipOffset}px`;
            tooltip.style.top = `30px`;
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        };

        const hideTooltip = () => {
            tracker.style.opacity = '0';
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';
            points.forEach(point => {
                point.setAttribute('r', '5');
                point.setAttribute('stroke-width', '3');
            });
        };

        // Event Listeners for smooth tracking
        svg.addEventListener('mousemove', showTooltip);
        svg.addEventListener('mouseleave', hideTooltip);
    };

    // Initialize Chart and handle window resizing
    initChart();
    window.addEventListener('resize', initChart);
});
