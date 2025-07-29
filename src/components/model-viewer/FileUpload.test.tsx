import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileUpload } from "./FileUpload";

// Mock global fetch using vi.stubGlobal (recommended by Vitest docs)
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const mockOnFileSelect = vi.fn();

describe("FileUpload", () => {
  beforeEach(() => {
    mockOnFileSelect.mockClear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<FileUpload onFileSelect={mockOnFileSelect} />);

    expect(screen.getByText("Drop your VRM file here")).toBeInTheDocument();
    expect(screen.getByText("or click to browse")).toBeInTheDocument();
    expect(screen.getByText("Try with Sample Model")).toBeInTheDocument();
  });

  describe("File validation", () => {
    it("accepts valid VRM files", () => {
      const validFile = new File(["test"], "test.vrm", {
        type: "application/octet-stream",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
    });

    it("rejects files that are too large", async () => {
      const largeFile = new File(["x".repeat(51 * 1024 * 1024)], "large.vrm", {
        type: "application/octet-stream",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
      expect(screen.getByText("File too large (max 50MB)")).toBeInTheDocument();
    });

    it("rejects non-VRM files", async () => {
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
      expect(screen.getByText("Please select a VRM file")).toBeInTheDocument();
    });

    it("rejects files with invalid MIME type", async () => {
      const invalidFile = new File(["test"], "test.vrm", {
        type: "text/plain",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
      expect(screen.getByText("Invalid file type")).toBeInTheDocument();
    });

    it("shows validation error for invalid files", async () => {
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(screen.getByText("Please select a VRM file")).toBeInTheDocument();
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("Drag and drop functionality", () => {
    it("handles drag over correctly", () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const dropZone = document.querySelector(".cursor-pointer") as HTMLElement;
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });

      expect(dropZone).toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("handles drag leave correctly", () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const dropZone = document.querySelector(".cursor-pointer") as HTMLElement;
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });
      fireEvent.dragLeave(dropZone!, { dataTransfer: { files: [] } });

      expect(dropZone).toHaveClass("border-gray-300");
      expect(dropZone).not.toHaveClass("border-blue-500", "bg-blue-50");
    });

    it("handles file drop correctly", () => {
      const validFile = new File(["test"], "test.vrm", {
        type: "application/octet-stream",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const dropZone = document.querySelector(".cursor-pointer") as HTMLElement;
      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [validFile] },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
    });
  });

  describe("Sample model functionality", () => {
    it("calls fetch when sample model button is clicked", async () => {
      const mockBlob = new Blob(["sample data"], { type: "model/vrm" });

      mockFetch.mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob),
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const sampleButton = screen.getByText("Try with Sample Model");

      fireEvent.click(sampleButton);

      expect(mockFetch).toHaveBeenCalledWith(
        "/VRM1_Constraint_Twist_Sample.vrm",
      );
    });

    it("disables inputs while loading sample model", async () => {
      let resolvePromise: (value: unknown) => void;
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(mockPromise);

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const sampleButton = screen.getByRole("button", {
        name: "Try with Sample Model",
      });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.click(sampleButton);

      expect(sampleButton).toBeDisabled();
      expect(fileInput).toBeDisabled();

      const mockBlob = new Blob(["sample data"], { type: "model/vrm" });
      resolvePromise!({ blob: () => Promise.resolve(mockBlob) });

      await waitFor(() => {
        expect(sampleButton).not.toBeDisabled();
        expect(fileInput).not.toBeDisabled();
      });
    });
  });

  describe("Error handling", () => {
    it("displays external error prop", () => {
      const error = new Error("External error");

      render(<FileUpload onFileSelect={mockOnFileSelect} error={error} />);

      expect(screen.getByText("External error")).toBeInTheDocument();
    });

    it("prioritizes validation error over external error", () => {
      const error = new Error("External error");
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} error={error} />);

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(screen.getByText("Please select a VRM file")).toBeInTheDocument();
      expect(screen.queryByText("External error")).not.toBeInTheDocument();
    });
  });

  describe("Click functionality", () => {
    it("triggers file input when clicking the drop zone", () => {
      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const dropZone = document.querySelector(".cursor-pointer") as HTMLElement;
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const clickSpy = vi.spyOn(fileInput!, "click");

      fireEvent.click(dropZone!);

      expect(clickSpy).toHaveBeenCalled();
    });

    it("prevents event propagation when clicking sample model button", () => {
      const mockBlob = new Blob(["sample data"], { type: "model/vrm" });

      mockFetch.mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob),
      });

      render(<FileUpload onFileSelect={mockOnFileSelect} />);

      const sampleButton = screen.getByText("Try with Sample Model");
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const clickSpy = vi.spyOn(fileInput!, "click");

      fireEvent.click(sampleButton);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});
