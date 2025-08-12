import { GPT4oMessage } from "@/constants/gpt4o";
import { GPT4O_CONSTANTS, STREAMING_EVENTS } from "@/constants/gpt4o";
import { 
  parseStreamData, 
  createThrottle, 
  cleanupEventSource 
} from "@/utils/gpt4o";

export interface StreamingCallbacks {
  onData: (content: string) => void;
  onDone: (finalContent: string) => void;
  onError: (error: Error) => void;
}

export class GPT4oStreamingService {
  private eventSource: EventSource | null = null;
  private contentBuffer = "";
  private throttledUpdate: Function;

  constructor(private callbacks: StreamingCallbacks) {
    // Create throttled update function for smooth UI
    this.throttledUpdate = createThrottle(
      (content: string) => this.callbacks.onData(content),
      GPT4O_CONSTANTS.UPDATE_THROTTLE
    );
  }

  /**
   * Start streaming from prediction URL
   */
  public startStreaming(streamUrl: string): void {
    this.cleanup();
    this.contentBuffer = "";
    
    try {
      this.eventSource = new EventSource(streamUrl);
      this.setupEventListeners();
    } catch (error) {
      this.callbacks.onError(new Error(`Failed to create EventSource: ${error}`));
    }
  }

  /**
   * Stop streaming and cleanup
   */
  public stopStreaming(): void {
    this.cleanup();
  }

  /**
   * Get current buffered content
   */
  public getCurrentContent(): string {
    return this.contentBuffer;
  }

  /**
   * Setup event listeners for streaming
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    // Handle streaming data
    this.eventSource.addEventListener(STREAMING_EVENTS.OUTPUT, (event) => {
      this.handleStreamData(event);
    });

    // Handle completion
    this.eventSource.addEventListener(STREAMING_EVENTS.DONE, () => {
      this.handleStreamComplete();
    });

    // Handle generic error events
    this.eventSource.addEventListener(STREAMING_EVENTS.ERROR, (event) => {
      this.handleStreamError(new Error(`Stream error: ${event}`));
    });

    // Handle connection errors
    this.eventSource.onerror = (event) => {
      this.handleStreamError(new Error("EventSource connection error"));
    };
  }

  /**
   * Handle incoming stream data
   */
  private handleStreamData(event: MessageEvent): void {
    try {
      const outputData = parseStreamData(event.data);
      this.contentBuffer += outputData;
      
      // Use throttled update for smooth UI
      this.throttledUpdate(this.contentBuffer);
    } catch (error) {
      console.error("Stream data parsing error:", error);
    }
  }

  /**
   * Handle stream completion
   */
  private handleStreamComplete(): void {
    // Final update with complete content
    this.callbacks.onData(this.contentBuffer);
    this.callbacks.onDone(this.contentBuffer);
    this.cleanup();
  }

  /**
   * Handle stream errors
   */
  private handleStreamError(error: Error): void {
    this.callbacks.onError(error);
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    cleanupEventSource(this.eventSource);
    this.eventSource = null;
  }
}

/**
 * Factory function to create streaming service
 */
export const createStreamingService = (callbacks: StreamingCallbacks): GPT4oStreamingService => {
  return new GPT4oStreamingService(callbacks);
};