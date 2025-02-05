import { FileReq } from "@_types/nft";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-iron-session";
import { addressCheckMiddleware, pinataApiKey, pinataSecretApiKey, withSession } from "./utils";
import FormData from "form-data";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// The allowed file types can include doc, pdf, jpg, png, etc.
const ALLOWED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default withSession(async (
  req: NextApiRequest & { session: Session },
  res: NextApiResponse
) => {
  if (req.method === "POST") {
    const {
      bytes,
      fileName,
      contentType
    } = req.body as FileReq;

    if (!bytes || !fileName || !contentType) {
      return res.status(422).send({ message: "File data is missing" });
    }

    // Check if the file type is allowed
    if (!ALLOWED_FILE_TYPES.includes(contentType)) {
      return res.status(422).send({ message: "Unsupported file type. Only PDF and DOC files are allowed." });
    }

    await addressCheckMiddleware(req, res);

    const buffer = Buffer.from(Object.values(bytes));
    const formData = new FormData();

    // Append the file to FormData
    formData.append(
      "file",
      buffer, {
        contentType,
        filename: fileName + "-" + uuidv4()
      }
    );

    try {
      // Pin the file to IPFS using Pinata
      const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey
        }
      });

      return res.status(200).send(fileRes.data);

    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
      return res.status(500).send({ message: "Error uploading file" });
    }

  } else {
    return res.status(422).send({ message: "Invalid endpoint" });
  }
});
