import { Router } from "express";
import { PrismaClient, ContractStatus } from "../../prisma/generated/index.js";

import { notifyContractFinalized } from "../lib/socket.js";

const prisma = new PrismaClient();
const router: Router = Router();

// POST /api/contracts - Upload/create contract
router.post("/", async (req, res) => {
  try {
    const { clientName, data, status, userId } = req.body;

    const contract = await prisma.contract.create({
      data: {
        clientName,
        data,
        status: status ?? ContractStatus.DRAFT,
        userId,
      } as any,
    });

    res.status(201).json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/contracts - List contracts with filters/search/pagination
router.get("/", async (req, res) => {
  try {
    const {
      userId,
      status,
      clientName,
      id,
      page = 1,
      pageSize = 10,
    } = req.query as any;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request body" });
    }

    const where: any = {};
    if (status) where.status = status;
    if (clientName)
      where.clientName = { contains: clientName, mode: "insensitive" };
    // prefer id filter; support legacy contractId by mapping to id for now
    if (id) where.id = { equals: id };

    const contracts = await prisma.contract.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.contract.count({ where });

    res.json({
      data: contracts,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/:id - Get single contract
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json(contract);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contracts/finalize - Mark contract as finalized
router.put("/finalize", async (req, res) => {
  try {
    const { id } = req.body;
    const contract = await prisma.contract.update({
      where: { id },
      data: { status: ContractStatus.FINALIZED },
    });

    if (!contract) return res.status(404).json({ error: "Contract not found" });

    notifyContractFinalized(id);
    res.json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/contracts/:id - Update contract
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, data, status, userId } = req.body;

    const contract = await prisma.contract.update({
      where: { id, userId },
      data: { clientName, data, status },
    });

    if (status === ContractStatus.FINALIZED) {
      notifyContractFinalized(id);
    }

    res.json(contract);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/contracts/:id - Delete contract
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { userId } = req.query;
    if (Array.isArray(userId)) userId = userId[0];
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }
    await prisma.contract.delete({ where: { id, userId } });
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
