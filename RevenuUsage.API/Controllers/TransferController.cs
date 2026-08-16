using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RevenuUsage.Application.DTOs;
using RevenuUsage.Application.Features.Transfers.Commands.ConfirmTransfer;
using RevenuUsage.Application.Features.Transfers.Commands.CreateTransfer;
using RevenuUsage.Application.Features.Transfers.Queries.GetCorrespondentAccountStatement;
using RevenuUsage.Application.Features.Transfers.Queries.GetCurrencyStatement;
using RevenuUsage.Application.Features.Transfers.Queries.GetFinalBankPosition;
using RevenuUsage.Application.Features.Transfers.Queries.GetTransfers;

namespace RevenuUsage.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransferController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TransferController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PagedResponse<TransferListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PagedResponse<TransferListItemDto>>> GetTransfers(
            [FromQuery] GetTransfersQuery query,
            CancellationToken cancellationToken)
        {
            return Ok(await _mediator.Send(query, cancellationToken));
        }


        [HttpPost]
        public async Task<ActionResult> CreateTransfer([FromBody] CreateTransferDto request, CancellationToken cancellationToken)
        {
            var command = new CreateTransferCommand(
                request.CorrespondentAccountId,
                request.BeneficiaryId,
                request.Purpose,
                request.ReferenceNo,
                request.CreatedBy,
                request.TransferDate,
                request.Amount,
                request.transferId,
                request.OperationTypeId,
                request.ResourceTypeId,
                request.UsageTypeId,
                request.BankId);

            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Transfer added successfully" });
        }


        [HttpPut("ConfirmTransfer")]
        public async Task<ActionResult> ConfirmTransfer([FromBody] ConfirmTransferDto request, CancellationToken cancellationToken)
        {
            var command = new ConfirmTransferCommand(
                request.TransferId, request.ConfirmedBy);

            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Transfer Confirmed successfully" });
        }

        [HttpPut("RejectTransfer")]
        public async Task<ActionResult> RejectTransfer([FromBody] RejectTransferDto request, CancellationToken cancellationToken)
        {
            var command = new RejectTransferCommand(
                request.TransferId, request.RejectReason, request.RejectedBy);

            await _mediator.Send(command, cancellationToken);
            return Ok(new { message = "Transfer Rejected successfully" });
        }


        [HttpDelete("{transferId}")]
        public async Task<ActionResult> DeleteTransfer([FromRoute] Guid transferId, [FromBody] DeleteTransferDto request, CancellationToken cancellationToken)
        {
            var command = new DeleteTransferCommand(transferId, request.DeletedBy);

            await _mediator.Send(command, cancellationToken);

            return Ok(new { message = "Transfer deleted successfully" });
        }

        [HttpGet("Statement/GetCorrespondentAccountStatement")]
        public async Task<ActionResult<List<AccountStatementDto>>> GetCorrespondentAccountStatement([FromQuery] GetAccountStatementQuery query)
        {
            return Ok(await _mediator.Send(query));
        }

        [HttpGet("Statement/GetFinalBankPosition")]
        public async Task<ActionResult<FinalBankPositionDto>> GetFinalBankPosition([FromQuery] DateTime date)
        {
            var result = await _mediator.Send(new GetFinalBankPositionQuery(date));
            return Ok(result);
        }


        [HttpGet("Statement/GetCurrencyStatement")]
        public async Task<ActionResult<List<CurrencyStatementDto>>> GetCurrencyStatement(
            [FromQuery] Guid currencyId,
            [FromQuery] DateTime asOfDate)
        {
            var query = new GetCurrencyStatementQuery(currencyId, asOfDate);
            return Ok(await _mediator.Send(query));
        }

    }
}


