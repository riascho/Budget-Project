/**
 * @swagger
 * tags:
 *   name: Envelopes
 *   description: Budget envelope management
 */

/**
 * @swagger
 * /envelopes:
 *   get:
 *     summary: Get all envelopes
 *     tags: [Envelopes]
 *     responses:
 *       200:
 *         description: List of all envelopes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Envelope'
 */

/**
 * @swagger
 * /envelopes/{id}:
 *   get:
 *     summary: Get envelope by ID
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     responses:
 *       200:
 *         description: Envelope details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       404:
 *         description: Envelope not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /envelopes:
 *   post:
 *     summary: Create a new envelope
 *     tags: [Envelopes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "groceries"
 *               budget:
 *                 type: number
 *                 format: float
 *                 example: 500.00
 *             required:
 *               - title
 *               - budget
 *     responses:
 *       201:
 *         description: Envelope created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /envelopes/{id}:
 *   put:
 *     summary: Update an envelope
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "groceries"
 *               budget:
 *                 type: number
 *                 format: float
 *                 example: 600.00
 *     responses:
 *       200:
 *         description: Envelope updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       404:
 *         description: Envelope not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete an envelope
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     responses:
 *       204:
 *         description: Envelope deleted successfully
 *       404:
 *         description: Envelope not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /envelopes/{id}:
 *   post:
 *     summary: Make a transaction on an envelope
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 25.50
 *               description:
 *                 type: string
 *                 example: "Supermarket"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-03-15"
 *             required:
 *               - amount
 *               - date
 *               - description
 *     responses:
 *       201:
 *         description: Transaction completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Envelope not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /envelopes/{fromId}/{toId}:
 *   post:
 *     summary: Transfer budget between envelopes
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: fromId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Source envelope ID
 *       - in: path
 *         name: toId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Destination envelope ID
 *       - in: header
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           example: 45.00
 *         description: Amount to transfer between envelopes
 *     responses:
 *       200:
 *         description: Budget transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Budget transferred successfully"
 *                 fromEnvelope:
 *                   $ref: '#/components/schemas/Envelope'
 *                 toEnvelope:
 *                   $ref: '#/components/schemas/Envelope'
 *       404:
 *         description: One or both envelopes not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
