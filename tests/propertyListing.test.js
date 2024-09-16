const request = require("supertest");
const app = require("../app");
const { setupDatabase, teardownDatabase } = require("./test-setup");
const cloudinary = require("cloudinary").v2;

// Mock Cloudinary
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "http://example.com/photo.jpg",
      }),
    },
    url: jest
      .fn()
      .mockImplementation(
        (public_id, options) => `http://example.com/${public_id}`
      ),
  },
}));

beforeEach(async () => {
  await setupDatabase(); // Set up the database before each test
});

afterEach(async () => {
  await teardownDatabase(); // Tear down the database after each test
});

describe("Property Listing API", () => {
  test("should create a property listing with photos", async () => {
    const payload = {
      title: "Spacious 3-Bedroom House",
      listingType: "rent",
      usageType: "residential",
      propertyType: "house",
      propertySubType: "single-family",
      propertyCondition: "new",
      state: "California",
      lga: "Los Angeles",
      neighbourhood: "Downtown",
      size: "1200 sqft",
      propertyDetails:
        "A beautiful and spacious 3-bedroom house with a large backyard.",
      NoOfLivingRooms: "1",
      NoOfBedRooms: "3",
      NoOfKitchens: "1",
      NoOfParkingSpace: "2",
      Price: "2500",
      virtualTour: "http://example.com/virtual-tour",
      video: "http://example.com/video-tour",
      photo: ["photo1.jpg", "photo2.jpg"],
    };

    const response = await request(app)
      .post("/propertyListing/createPropertyListing")
      .send(payload);

    // Check if Cloudinary's upload function was called
    expect(cloudinary.v2.uploader.upload).toHaveBeenCalledTimes(
      payload.photo.length
    );
    payload.photo.forEach((photo) => {
      expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining(photo)
      );
    });

    // Check if the response status and body are correct
    expect(response.status).toBe(201); // Assuming successful creation returns 201
    expect(response.body.title).toBe(payload.title);
    expect(response.body.listingType).toBe(payload.listingType);
    expect(response.body.usageType).toBe(payload.usageType);
    expect(response.body.propertyType).toBe(payload.propertyType);
    expect(response.body.propertySubType).toBe(payload.propertySubType);
    expect(response.body.propertyCondition).toBe(payload.propertyCondition);
    expect(response.body.state).toBe(payload.state);
    expect(response.body.lga).toBe(payload.lga);
    expect(response.body.neighbourhood).toBe(payload.neighbourhood);
    expect(response.body.size).toBe(payload.size);
    expect(response.body.propertyDetails).toBe(payload.propertyDetails);
    expect(response.body.NoOfLivingRooms).toBe(payload.NoOfLivingRooms);
    expect(response.body.NoOfBedRooms).toBe(payload.NoOfBedRooms);
    expect(response.body.NoOfKitchens).toBe(payload.NoOfKitchens);
    expect(response.body.NoOfParkingSpace).toBe(payload.NoOfParkingSpace);
    expect(response.body.Price).toBe(payload.Price);
    expect(response.body.virtualTour).toBe(payload.virtualTour);
    expect(response.body.video).toBe(payload.video);
    expect(response.body.photo).toEqual(payload.photo);
  });
});
