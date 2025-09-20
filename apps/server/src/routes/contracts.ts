import { Router } from "express";
import { PrismaClient, ContractStatus } from "prisma/generated";

import { notifyContractFinalized } from "../lib/socket";

const prisma = new PrismaClient();
const router: Router = Router();

// POST /api/contracts - Upload/create contract
router.post("/", async (req, res) => {
  try {
    const { clientName, data, status } = req.body;

    const contract = await prisma.contract.create({
      // After removing `contractId` from schema, generated types will not require it. Until then,
      // keep this cast to satisfy types pre-migration.
      data: {
        clientName,
        data,
        status: status ?? ContractStatus.DRAFT,
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
      status,
      clientName,
      id,
      contractId, // deprecated shim
      page = 1,
      pageSize = 10,
    } = req.query as any;

    const where: any = {};
    if (status) where.status = status;
    if (clientName)
      where.clientName = { contains: clientName, mode: "insensitive" };
    // prefer id filter; support legacy contractId by mapping to id for now
    if (id) where.id = { equals: id };
    else if (contractId) where.id = { equals: contractId };

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

// PUT /api/contracts/:id - Update contract
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, data, status } = req.body;

    const contract = await prisma.contract.update({
      where: { id },
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
    await prisma.contract.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
