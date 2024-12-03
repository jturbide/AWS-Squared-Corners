// Function to inject CSS into a document
const injectCSS = (doc) => {
    if (!doc || !doc.head) return; // Ensure the document and head exist
    const style = doc.createElement("style");
    style.textContent = `
        a, button {
            border-radius: 0 !important;
            border-start-start-radius: 0 !important;
            border-start-end-radius: 0 !important;
            border-end-start-radius: 0 !important;
            border-end-end-radius: 0 !important;
        }
    `;
    doc.head.appendChild(style);
};

// Function to process an iframe and inject CSS
const processIframe = (iframe, processedIframes) => {
    if (processedIframes.has(iframe)) return; // Skip if already processed
    try {
        if (iframe.contentDocument) {
            injectCSS(iframe.contentDocument); // Inject CSS into iframe's document
            processedIframes.add(iframe); // Mark iframe as processed
        } else {
            iframe.addEventListener("load", () => {
                processIframe(iframe, processedIframes); // Retry after load event
            });
        }
    } catch (e) {
        console.warn("Could not access iframe content:", e);
    }
};

// Function to handle all iframes
const handleIframes = (processedIframes) => {
    document.querySelectorAll("iframe").forEach((iframe) => processIframe(iframe, processedIframes));
};

// Function to start observing for dynamic iframes
const observeDynamicIframes = (processedIframes) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === "IFRAME") {
                    processIframe(node, processedIframes);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
};

// Start polling for iframes (fallback for MutationObserver misses)
const startIframePolling = (processedIframes) => {
    setTimeout(() => {
        handleIframes(processedIframes);
    }, 1000); // run after 1 second
};

// Main function to initialize CSS injection
const initialize = () => {
    const processedIframes = new WeakSet(); // Track processed iframes

    injectCSS(document); // Inject CSS into the main document
    handleIframes(processedIframes); // Process existing iframes
    observeDynamicIframes(processedIframes); // Observe dynamic iframe additions
    startIframePolling(processedIframes); // Start polling as a fallback
};

// Ensure the script runs after the page is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
    initialize();
} else {
    window.addEventListener("DOMContentLoaded", initialize);
}
